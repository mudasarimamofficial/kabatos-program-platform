'use client'

import React, { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'
import type { SubscriptionState } from '@/lib/stripe/plan'

export function SuccessScreen({ brand, initialSubscription }: { brand: Brand; initialSubscription: SubscriptionState }) {
  const [subscription, setSubscription] = useState(initialSubscription)
  useEffect(() => {
    if (subscription.access) return
    const timer = setInterval(async () => {
      const res = await fetch(`/api/stripe/subscription?brandSlug=${encodeURIComponent(brand.slug)}`, { cache: 'no-store' }).catch(() => null)
      if (res?.ok) setSubscription(await res.json())
    }, 3000)
    return () => clearInterval(timer)
  }, [brand.slug, subscription.access])
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main centered motion-card-reveal">
        <div className="success-icon large motion-pulse-ambient">
          <Check size={36} className="motion-checkmark" aria-hidden="true" />
        </div>
        <h2>{subscription.access ? 'Your program is ready' : 'Confirming your subscription'}</h2>
        <p className="body-copy">
          {subscription.access ? (subscription.status === 'trialing' ? 'Your 7-day free trial has started. Your subscription is active.' : 'Your activation is confirmed.') : 'We are waiting for verified subscription confirmation. Returning from checkout alone does not activate your program.'}
        </p>
        {subscription.access && <Button href={`/${brand.slug}/dashboard`}>
          Go to my dashboard <ArrowRight size={18} />
        </Button>}
      </main>
    </CustomerShell>
  )
}
