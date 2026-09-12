'use client'

import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import type { Brand } from '@/lib/types'

export function CustomerShell({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return (
    <div
      className="customer-shell"
      style={
        {
          '--brand-runtime': brand.theme.primary,
          '--brand-hover-runtime': brand.theme.primaryHover,
          '--brand-text-runtime': brand.theme.primaryText,
          '--surface-runtime': brand.theme.highlight,
          '--highlight-border-runtime': brand.theme.highlightBorder,
        } as React.CSSProperties
      }
    >
      <header className="customer-header">
        <BrandLogo brand={brand} />
      </header>
      {children}
      <footer className="customer-footer">
        <ShieldCheck size={14} aria-hidden="true" /> Your information is kept private and secure.
      </footer>
    </div>
  )
}
