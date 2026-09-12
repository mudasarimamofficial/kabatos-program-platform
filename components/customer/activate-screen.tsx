'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

export function ActivateScreen({ brand }: { brand: Brand }) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main centered">
        <div className="success-icon">
          <Check size={26} aria-hidden="true" />
        </div>
        <h2>Program activation</h2>
        <p className="body-copy">Your {brand.name} program is ready to activate.</p>
        <div className="detail-card">
          <div>
            <span>Program</span>
            <strong>{brand.productName}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{brand.duration} days</strong>
          </div>
          <div>
            <span>Your schedule</span>
            <strong>{brand.schedule.length} scheduled uses</strong>
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
