import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getStripe, billingDb, rpc, customerCapability, approvedPriceId, assertApprovedPrice } from '@/lib/stripe/server'
import { COMPREX_PLAN } from '@/lib/stripe/plan'
import { checkoutInputSchema } from '@/lib/stripe/validation'
import { getTrustedAppOrigin } from '@/lib/app-origin'

export async function POST(request: Request) {
  const parsed = checkoutInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
  if (parsed.data.brandSlug !== COMPREX_PLAN.brandSlug) return NextResponse.json({ error: 'Checkout unavailable' }, { status: 403 })
  let token: string
  try { token = await customerCapability() } catch { return NextResponse.json({ error: 'Customer session required' }, { status: 401 }) }
  try {
    const stripe = getStripe()
    const priceId = approvedPriceId()
    const reservation = await rpc(billingDb(), 'customer_checkout_reserve', {
      p_brand_slug: parsed.data.brandSlug, p_capability: token, p_request_id: randomUUID(),
    })
    if (reservation.stripe_price_id !== priceId) throw new Error('Unapproved snapshot price')
    assertApprovedPrice(await stripe.prices.retrieve(priceId))
    const db = billingDb(true)
    const { data: attempt, error } = await db.from('checkout_attempts').select('id,program_id,brand_id,stripe_session_id,created_at').eq('id', reservation.attempt_id).single()
    if (error || !attempt) throw new Error('Checkout unavailable')
    const origin = getTrustedAppOrigin()
    const metadata = { attemptId: attempt.id, brandSlug: COMPREX_PLAN.brandSlug }
    // A DB reservation and stable Stripe idempotency key prevent double-click subscriptions.
    const session = attempt.stripe_session_id ? await stripe.checkout.sessions.retrieve(attempt.stripe_session_id) : await stripe.checkout.sessions.create({
      mode: 'subscription', payment_method_types: ['card'], payment_method_collection: 'always',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/${COMPREX_PLAN.brandSlug}/success`,
      cancel_url: `${origin}/${COMPREX_PLAN.brandSlug}/checkout?checkout=cancelled`,
      metadata, subscription_data: { metadata, trial_period_days: COMPREX_PLAN.trialDays },
      // Based on persisted creation time so retries send identical parameters.
      expires_at: Math.floor(Date.parse(attempt.created_at) / 1000) + 3600,
    }, { idempotencyKey: `kabatos-checkout-${attempt.id}` })
    if (session.livemode || !session.url || session.status !== 'open') throw new Error('Checkout unavailable')
    await rpc(db, 'stripe_link_checkout_attempt', { p_attempt_id: attempt.id, p_stripe_session_id: session.id, p_expires_at: new Date(session.expires_at * 1000).toISOString() })
    return NextResponse.json({ url: session.url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Checkout unavailable. Please retry or return to onboarding.' }, { status: 503 })
  }
}
