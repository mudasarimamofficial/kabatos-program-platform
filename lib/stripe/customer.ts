import 'server-only'
import { randomUUID } from 'node:crypto'
import { billingDb, rpc, customerCapability, getStripe } from './server'
import { stripeId } from './reconcile'
import type { SubscriptionState } from './plan'

export async function getSubscriptionState(slug: string): Promise<SubscriptionState | null> {
  try {
    return await rpc(billingDb(), 'customer_subscription_status', { p_brand_slug: slug, p_capability: await customerCapability() })
  } catch { return null }
}
export async function cancelCustomerSubscription(slug: string, capability: string, stripe = getStripe(), db = billingDb(true)) {
  const context = await rpc(db, 'stripe_customer_subscription_context', { p_brand_slug: slug, p_capability: capability })
  const owner = randomUUID()
  const lease = await rpc(db, 'stripe_claim_reconcile', { p_program_id: context.program_id, p_brand_id: context.brand_id, p_lease_owner: owner })
  try {
    const sub = await stripe.subscriptions.retrieve(context.stripe_subscription_id)
    if (sub.livemode || stripeId(sub.customer) !== context.stripe_customer_id) throw new Error('Subscription unavailable')
    if (['canceled','incomplete_expired'].includes(sub.status)) return
    const updated = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true }, { idempotencyKey: `kabatos-cancel-${sub.id}` })
    if (!updated.cancel_at_period_end) throw new Error('Cancellation pending')
    await rpc(db, 'stripe_persist_cancellation', {
      p_program_id: context.program_id, p_lease_owner: owner, p_fence: lease.fence,
      p_subscription_id: sub.id, p_canceled_at: updated.canceled_at ? new Date(updated.canceled_at * 1000).toISOString() : null,
    })
  } finally {
    await rpc(db, 'stripe_release_reconcile', { p_program_id: context.program_id, p_lease_owner: owner, p_fence: lease.fence })
  }
}
