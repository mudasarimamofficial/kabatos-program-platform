'use client'

import React from 'react'
import type { Brand } from '@/lib/types'

export function BrandLogo({ brand, small = false }: { brand: Brand; small?: boolean }) {
  return (
    <div className={`logo ${small ? 'logo-small' : ''}`} aria-label={brand.name}>
      <span className="logo-mark" aria-hidden="true" style={{ borderColor: brand.theme.primary }}>
        <span style={{ borderColor: brand.theme.primary }} />
      </span>
      <span>{brand.name}</span>
    </div>
  )
}
