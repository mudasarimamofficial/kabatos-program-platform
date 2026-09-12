import { NextResponse } from 'next/server'
import { getStripe, normalizeSubscriptionStatus, parseCheckoutReference } from '@/lib/stripe/server'
import { requireServerEnv } from '@/lib/env'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, requireServerEnv('STRIPE_WEBHOOK_SECRET'))
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  const object = event.data.object as Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice
  const metadata = 'metadata' in object ? object.metadata : undefined
  const reference = parseCheckoutReference(metadata)
  const status = event.type.startsWith('customer.subscription.') ? normalizeSubscriptionStatus((object as Stripe.Subscription).status) : undefined
  console.info('[stripe] event received', { id: event.id, type: event.type, reference, status, persistence: 'PENDING_SUPABASE' })
  return NextResponse.json({ received: true, eventId: event.id, status: status ?? 'received', persistence: 'PENDING_SUPABASE' })
}
