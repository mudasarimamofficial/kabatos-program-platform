'use client'

import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

export function SuccessScreen({ brand }: { brand: Brand }) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main centered">
        <div className="success-icon large">
          <Check size={34} aria-hidden="true" />
        </div>
        <h2>Your program is ready</h2>
        <p className="body-copy">
          Your {brand.name} activation is confirmed. Your dashboard is ready when you are.
        </p>
        <Button href={`/${brand.slug}/dashboard`}>
          Go to my dashboard <ArrowRight size={18} />
        </Button>
      </main>
    </CustomerShell>
  )
}
