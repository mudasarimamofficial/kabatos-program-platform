'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Check, Clock, ShieldCheck } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

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

