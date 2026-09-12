'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

export function WelcomeScreen({ brand }: { brand: Brand }) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main welcome-main">
        <div className="eyebrow">A calmer way to stay consistent</div>
        <h1>
          Your program,<br />
          <em>made simple.</em>
        </h1>
        <p className="lead">
          Follow your {brand.name} schedule, see your progress, and keep moving forward with clarity.
        </p>
        <div className="product-visual">
          <Package size={52} strokeWidth={1.25} aria-hidden="true" style={{ color: 'var(--brand-runtime)' }} />
          <div>
            <strong>{brand.name}</strong>
            <span>{brand.productName}</span>
          </div>
        </div>
        <Button href={`/${brand.slug}/start`}>
          Start my program <ArrowRight size={18} />
        </Button>
        <p className="microcopy">
          Already started?{' '}
          <Link className="inline-link" href={`/${brand.slug}/dashboard`}>
            View your program
          </Link>
        </p>
      </main>
    </CustomerShell>
  )
}
