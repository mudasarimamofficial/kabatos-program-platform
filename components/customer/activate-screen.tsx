'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Check, Clock, ShieldCheck } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'
import { COMPREX_PLAN } from '@/lib/stripe/plan'

export function ActivateScreen({ brand }: { brand: Brand }) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main centered motion-card-reveal">
        <div className="success-icon motion-pulse-ambient">
          <Check size={28} className="motion-checkmark" aria-hidden="true" />
        </div>
        <h2>Program activation</h2>
        <p className="body-copy">Your {brand.name} wellness program is ready to begin.</p>
        <div className="detail-card">
          <div>
            <span>Program</span>
            <strong>{brand.name} · {brand.productName}</strong>
          </div>
          <div>
            <span><Calendar size={14} aria-hidden="true" style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Duration</span>
            <strong>{brand.duration} days</strong>
          </div>
          <div>
            <span><Clock size={14} aria-hidden="true" style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Schedule</span>
            <strong>{brand.schedule.length} scheduled uses</strong>
          </div>
          <div>
            <span><ShieldCheck size={14} aria-hidden="true" style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Tracking</span>
            <strong>Progress &amp; refill alerts</strong>
          </div>
        </div>
        {brand.slug === COMPREX_PLAN.brandSlug && <p className="body-copy">
          {COMPREX_PLAN.trialLabel}. Then {COMPREX_PLAN.priceLabel}, renewing automatically each month unless you cancel.
          Cancel anytime; access remains through your trial or paid period. Tracking/service subscription only. Physical product sold separately.
        </p>}
        <Button href={`/${brand.slug}/checkout`}>
          Activate my program <ArrowRight size={18} />
        </Button>
        <Link className="text-link centered-link" href={`/${brand.slug}`}>
          Back
        </Link>
      </main>
    </CustomerShell>
  )
}
