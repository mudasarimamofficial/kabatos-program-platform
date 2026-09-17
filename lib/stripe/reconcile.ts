import 'server-only'
import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { billingDb, getStripe, rpc, assertApprovedPrice } from './server'
import { COMPREX_PLAN } from './plan'

const supported = new Set(['checkout.session.completed','customer.subscription.created','customer.subscription.updated',
  'customer.subscription.deleted','invoice.paid','invoice.payment_failed'])
export const stripeId = (value: string | { id: string } | null | undefined) => typeof value === 'string' ? value : value?.id
const iso = (value: number | null | undefined) => value == null ? null : new Date(value * 1000).toISOString()

export function subscriptionValues(sub: Stripe.Subscription) {
  if (sub.livemode || sub.items.data.length !== 1 || sub.items.data[0].quantity !== 1) throw new Error('Unapproved subscription')
  const item = sub.items.data[0]
  assertApprovedPrice(item.price)
  return {
    p_stripe_customer_id: stripeId(sub.customer), p_stripe_subscription_id: sub.id,
    p_stripe_price_id: item.price.id, p_status: sub.status,
    p_current_period_start: iso(item.current_period_start), p_current_period_end: iso(item.current_period_end),
    p_cancel_at_period_end: sub.cancel_at_period_end, p_trial_start: iso(sub.trial_start),
    p_trial_end: iso(sub.trial_end), p_canceled_at: iso(sub.canceled_at),
  }
}

/** Signed events are wake-ups: retrieve current provider state under the DB fence, never apply stale event snapshots. */
export async function reconcileStripeEvent(event: Stripe.Event, stripe = getStripe(), db = billingDb(true)) {
  if (event.livemode) throw new Error('Live events rejected')
  if (!supported.has(event.type)) return { status: 'unhandled_type' }
  const object = event.data.object
  if (!('id' in object)) return { status: 'unrelated_event' }
  let subscriptionId: string | undefined
  if (object.object === 'checkout.session') subscriptionId = stripeId(object.subscription)
  if (object.object === 'subscription') subscriptionId = object.id
  if (object.object === 'invoice') subscriptionId = stripeId(object.parent?.subscription_details?.subscription)
  if (!subscriptionId) return { status: 'unrelated_event' }
  const { data: known, error: knownError } = await db.from('subscriptions').select('program_id,brand_id,stripe_customer_id').eq('stripe_subscription_id', subscriptionId).maybeSingle()
  if (knownError) throw new Error('Subscription lookup unavailable')
  let binding = known
  let checkoutId: string | null = null
  if (!binding) {
    const preliminary = await stripe.subscriptions.retrieve(subscriptionId)
    if (preliminary.metadata.brandSlug !== COMPREX_PLAN.brandSlug || !preliminary.metadata.attemptId) return { status: 'unrelated_event' }
    const { data: attempt, error } = await db.from('checkout_attempts').select('program_id,brand_id,stripe_session_id').eq('id', preliminary.metadata.attemptId).single()
    if (error || !attempt?.stripe_session_id) throw new Error('Checkout linkage pending')
    checkoutId = attempt.stripe_session_id
    binding = { program_id: attempt.program_id, brand_id: attempt.brand_id, stripe_customer_id: stripeId(preliminary.customer) }
  }
  const registration = await rpc(db, 'stripe_register_event', {
    p_event_id: event.id, p_event_type: event.type, p_livemode: false, p_object_id: object.id,
    p_program_id: binding.program_id, p_brand_id: binding.brand_id, p_provider_created_at: iso(event.created),
  })
  if (registration.status === 'processed') return { status: 'duplicate_ignored' }
  const owner = randomUUID()
  const lease = await rpc(db, 'stripe_claim_reconcile', { p_program_id: binding.program_id, p_brand_id: binding.brand_id, p_lease_owner: owner })
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const values = subscriptionValues(sub)
    if (stripeId(sub.customer) !== binding.stripe_customer_id) throw new Error('Subscription owner mismatch')
    let verified = false
    if (checkoutId) {
      const session = await stripe.checkout.sessions.retrieve(checkoutId)
      verified = !session.livemode && session.mode === 'subscription' && session.status === 'complete' &&
        ['paid','no_payment_required'].includes(session.payment_status) && stripeId(session.subscription) === sub.id &&
        stripeId(session.customer) === stripeId(sub.customer) && session.metadata?.attemptId === sub.metadata.attemptId &&
        sub.trial_start != null && sub.trial_end != null && sub.trial_end - sub.trial_start === COMPREX_PLAN.trialDays * 86400
      if (!verified) throw new Error('Checkout verification pending')
    }
    const result = await rpc(db, 'stripe_reconcile_subscription_v2', {
      p_program_id: binding.program_id, p_brand_id: binding.brand_id, p_lease_owner: owner, p_fence: lease.fence,
      p_event_id: event.id, p_provider_object_id: object.id, p_stripe_checkout_session_id: checkoutId,
      p_checkout_verified_complete: verified, ...values,
    })
    return { status: 'processed', ...result }
  } catch (error) {
    await rpc(db, 'stripe_mark_event_outcome', { p_event_id: event.id, p_outcome: 'failed', p_error_code: 'reconcile_retry_required' })
    throw error
  } finally {
    await rpc(db, 'stripe_release_reconcile', { p_program_id: binding.program_id, p_lease_owner: owner, p_fence: lease.fence })
  }
}
