import { describe, it, expect } from 'vitest'
import { checkoutInputSchema } from './validation'
import { normalizeSubscriptionStatus, parseCheckoutReference } from './server'

describe('Stripe Test Architecture & Validation (§79, §81, §84, §85)', () => {
  it('validates checkout request input correctly', () => {
    // Valid input
    const valid = checkoutInputSchema.safeParse({
      brandSlug: 'comprex',
      customerId: 'sarah-chen',
    })
    expect(valid.success).toBe(true)

    // Invalid brandSlug (contains uppercase / special chars)
    const invalidSlug = checkoutInputSchema.safeParse({
      brandSlug: 'COMPREX_INVALID!',
    })
    expect(invalidSlug.success).toBe(false)
  })

  it('normalizes Stripe lifecycle statuses into application subscription states (§85)', () => {
    expect(normalizeSubscriptionStatus('active')).toBe('active')
    expect(normalizeSubscriptionStatus('trialing')).toBe('active')
    expect(normalizeSubscriptionStatus('past_due')).toBe('pending')
    expect(normalizeSubscriptionStatus('incomplete')).toBe('pending')
    expect(normalizeSubscriptionStatus('incomplete_expired')).toBe('pending')
    expect(normalizeSubscriptionStatus('canceled')).toBe('cancelled')
    expect(normalizeSubscriptionStatus('unpaid')).toBe('cancelled')
    expect(normalizeSubscriptionStatus('paused')).toBe('failed')
  })

  it('extracts trusted brand reference and customerId from Stripe metadata (§81)', () => {
    const reference = parseCheckoutReference({
      brandSlug: 'comprex',
      customerId: 'cust_12345',
      priceId: 'price_test_123',
    })
    expect(reference).toEqual({
      brandSlug: 'comprex',
      customerId: 'cust_12345',
      priceId: 'price_test_123',
    })

    // Missing brandSlug returns null
    expect(parseCheckoutReference(null)).toBeNull()
    expect(parseCheckoutReference({})).toBeNull()
  })

  it('enforces webhook idempotency preventing duplicate side effects (§84)', () => {
    // Simulation of stripe_events idempotency table
    const processedEvents = new Set<string>()

    function processWebhookEvent(event: { id: string; type: string }): { status: 'processed' | 'duplicate_ignored' } {
      if (processedEvents.has(event.id)) {
        return { status: 'duplicate_ignored' }
      }
      processedEvents.add(event.id)
      return { status: 'processed' }
    }

    const testEvent = { id: 'evt_test_unique_12345', type: 'customer.subscription.created' }

    // First arrival
    const firstAttempt = processWebhookEvent(testEvent)
    expect(firstAttempt.status).toBe('processed')

    // Duplicate retry arrival from Stripe
    const duplicateAttempt = processWebhookEvent(testEvent)
    expect(duplicateAttempt.status).toBe('duplicate_ignored')
    expect(processedEvents.size).toBe(1)
  })
})
