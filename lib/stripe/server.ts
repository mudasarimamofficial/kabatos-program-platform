import 'server-only'
import Stripe from 'stripe'
import { requireServerEnv } from '@/lib/env'

let client: Stripe | undefined
export function getStripe() {
  return (client ??= new Stripe(requireServerEnv('STRIPE_SECRET_KEY')))
}

export type CheckoutReference = { brandSlug: string; customerId?: string; programId?: string; priceId?: string }

export function normalizeSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === 'active' || status === 'trialing') return 'active' as const
  if (status === 'past_due' || status === 'incomplete' || status === 'incomplete_expired') return 'pending' as const
  if (status === 'canceled' || status === 'unpaid') return 'cancelled' as const
  return 'failed' as const
}

export function parseCheckoutReference(metadata: Stripe.Metadata | null | undefined): CheckoutReference | null {
  const brandSlug = metadata?.brandSlug
  if (!brandSlug) return null
  return {
    brandSlug,
    customerId: metadata?.customerId,
    programId: metadata?.programId,
    priceId: metadata?.priceId,
  }
}

export interface WebhookProcessingResult {
  status: 'processed' | 'duplicate_ignored' | 'unhandled_type'
  subscriptionStatus?: string
  programActivated?: boolean
}

/**
 * Handles incoming verified Stripe webhook event idempotently.
 */
export function handleStripeWebhookEvent(
  event: { id: string; type: string; data: { object: any } },
  processedEventsStore = new Set<string>()
): WebhookProcessingResult {
  // Idempotency check
  if (processedEventsStore.has(event.id)) {
    return { status: 'duplicate_ignored' }
  }

  const obj = event.data.object
  const metadata = obj?.metadata
  const reference = parseCheckoutReference(metadata)

  let subscriptionStatus: string | undefined
  let programActivated = false

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subStatus = obj?.status as Stripe.Subscription.Status | undefined
      subscriptionStatus = subStatus ? normalizeSubscriptionStatus(subStatus) : 'active'
      if (subscriptionStatus === 'active') {
        programActivated = true
      }
      break
    }
    case 'customer.subscription.deleted': {
      subscriptionStatus = 'cancelled'
      break
    }
    case 'invoice.paid': {
      subscriptionStatus = 'active'
      programActivated = true
      break
    }
    case 'invoice.payment_failed': {
      subscriptionStatus = 'pending'
      break
    }
    default:
      return { status: 'unhandled_type' }
  }

  processedEventsStore.add(event.id)

  return {
    status: 'processed',
    subscriptionStatus,
    programActivated,
  }
}
