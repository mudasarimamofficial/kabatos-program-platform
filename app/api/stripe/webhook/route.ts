import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { reconcileStripeEvent } from '@/lib/stripe/reconcile'
import { requireServerEnv } from '@/lib/env'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, requireServerEnv('STRIPE_WEBHOOK_SECRET'))
    if (event.livemode) throw new Error('TEST only')
  } catch { return NextResponse.json({ error: 'Invalid signature or environment' }, { status: 400 }) }
  try {
    return NextResponse.json({ received: true, ...await reconcileStripeEvent(event) })
  } catch {
    // Non-2xx asks Stripe to retry. Never acknowledge an unpersisted relevant event.
    console.error('[stripe] reconciliation retry required', { eventId: event.id, type: event.type })
    return NextResponse.json({ error: 'Reconciliation pending; retry required' }, { status: 503 })
  }
}
