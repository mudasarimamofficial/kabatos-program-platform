import 'server-only'
import Stripe from 'stripe'
import { requireServerEnv } from '@/lib/env'

let client: Stripe | undefined
export function getStripe() {
  return (client ??= new Stripe(requireServerEnv('STRIPE_SECRET_KEY')))
}

export type CheckoutReference = { brandSlug: string; customerId?: string; priceId?: string }
export function normalizeSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === 'active' || status === 'trialing') return 'active' as const
  if (status === 'past_due' || status === 'incomplete' || status === 'incomplete_expired') return 'pending' as const
  if (status === 'canceled' || status === 'unpaid') return 'cancelled' as const
  return 'failed' as const
}

export function parseCheckoutReference(metadata: Stripe.Metadata | null | undefined): CheckoutReference | null {
  const brandSlug = metadata?.brandSlug
  if (!brandSlug) return null
  return { brandSlug, customerId: metadata?.customerId, priceId: metadata?.priceId }
}
