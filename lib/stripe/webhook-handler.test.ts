import { describe, it, expect, beforeEach } from 'vitest'
import { handleStripeWebhookEvent } from './server'

describe('Stripe Webhook Idempotency & Lifecycle (§83, §84, §85)', () => {
  let processedStore: Set<string>

  beforeEach(() => {
    processedStore = new Set<string>()
  })

  it('processes checkout.session.completed and signals program activation (§84)', () => {
    const event = {
      id: 'evt_checkout_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { brandSlug: 'comprex', customerId: 'cust_01' },
        },
      },
    }

    const result = handleStripeWebhookEvent(event, processedStore)
    expect(result.status).toBe('processed')
    expect(result.subscriptionStatus).toBe('active')
    expect(result.programActivated).toBe(true)
    expect(processedStore.has('evt_checkout_123')).toBe(true)
  })

  it('enforces idempotency and rejects duplicate webhook events (§84)', () => {
    const event = {
      id: 'evt_duplicate_test',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          status: 'active',
          metadata: { brandSlug: 'comprex' },
        },
      },
    }

    const first = handleStripeWebhookEvent(event, processedStore)
    expect(first.status).toBe('processed')
    expect(first.programActivated).toBe(true)

    // Second duplicate arrival
    const duplicate = handleStripeWebhookEvent(event, processedStore)
    expect(duplicate.status).toBe('duplicate_ignored')
    expect(duplicate.programActivated).toBeUndefined()
  })

  it('handles subscription cancellation without resetting program history (§85)', () => {
    const event = {
      id: 'evt_cancel_123',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_123',
          status: 'canceled',
          metadata: { brandSlug: 'comprex' },
        },
      },
    }

    const result = handleStripeWebhookEvent(event, processedStore)
    expect(result.status).toBe('processed')
    expect(result.subscriptionStatus).toBe('cancelled')
    expect(result.programActivated).toBe(false)
  })

  it('handles invoice.payment_failed transitioning subscription to pending (§85)', () => {
    const event = {
      id: 'evt_fail_123',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_test_123',
          metadata: { brandSlug: 'comprex' },
        },
      },
    }

    const result = handleStripeWebhookEvent(event, processedStore)
    expect(result.status).toBe('processed')
    expect(result.subscriptionStatus).toBe('pending')
  })
})
