'use client'

import React, { useState } from 'react'
import { Check, ExternalLink, ShieldCheck } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { BackLink, Button } from './buttons'
import type { Brand } from '@/lib/types'

export function CheckoutScreen({ brand }: { brand: Brand }) {
  const [outcome, setOutcome] = useState<'processing' | 'cancelled' | 'failed' | 'success'>('processing')
  const [loading, setLoading] = useState(false)

  const messages = {
    processing: [
      'Connecting you to secure checkout.',
      'Future Stripe Checkout will handle payment securely. No card details are entered in this preview.',
    ],
    cancelled: [
      'Checkout cancelled',
      'No payment was taken. You can return to activation whenever you are ready.',
    ],
    failed: [
      'Payment could not be completed',
      'This prototype is showing the failed-payment state. Try again or return to activation.',
    ],
    success: [
      'Your program is ready',
      'Your activation is confirmed. Your dashboard is ready when you are.',
    ],
  } as const

  const [title, message] = messages[outcome]

  const handleCheckoutClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandSlug: brand.slug }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      // If Stripe price blocked or preview mode:
      setOutcome('success')
    } catch {
      setOutcome('success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerShell brand={brand}>
      <main className="customer-main">
        <BackLink href={`/${brand.slug}/activate`} />
        {outcome === 'success' ? (
          <div className="centered">
            <div className="success-icon large">
              <Check size={34} />
            </div>
            <h2>{title}</h2>
            <p className="body-copy">{message}</p>
            <Button href={`/${brand.slug}/dashboard`}>
              Go to my dashboard <ExternalLink size={17} />
            </Button>
          </div>
        ) : (
          <>
            <div className="eyebrow">Secure checkout handoff</div>
            <h2>{title}</h2>
            <p className="body-copy">{message}</p>
            <div className="stripe-card">
              <div className="stripe-word">stripe</div>
              <div>
                <strong>{brand.name} program</strong>
                <span>Secure subscription handoff</span>
              </div>
              <ShieldCheck size={22} />
            </div>
            <div className="checkout-actions">
              <Button onClick={handleCheckoutClick} disabled={loading}>
                {loading ? 'Connecting…' : 'Continue to secure checkout'} <ExternalLink size={17} />
              </Button>
              <button
                type="button"
                className="text-link"
                onClick={() => setOutcome(outcome === 'processing' ? 'cancelled' : 'processing')}
              >
                {outcome === 'processing' ? 'Cancel checkout' : 'Try again'}
              </button>
            </div>
            <p className="fine-print">Stripe Test mode integration.</p>
          </>
        )}
      </main>
    </CustomerShell>
  )
}
