'use client'

import React from 'react'
import Image from 'next/image'
import type { Brand } from '@/lib/types'

export function BrandLogo({ brand, small = false }: { brand: Brand; small?: boolean }) {
  if (brand.logo) {
    return (
      <div className={`logo ${small ? 'logo-small' : ''} logo-image-wrap`}>
        <Image
          src={brand.logo}
          alt=""
          aria-hidden="true"
          width={small ? 116 : 146}
          height={small ? 26 : 32}
          priority
          style={{
            height: small ? '24px' : '30px',
            width: 'auto',
            maxHeight: small ? '24px' : '32px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <span className="sr-only">{brand.name}</span>
      </div>
    )
  }

  return (
    <div className={`logo ${small ? 'logo-small' : ''}`} aria-label={brand.name}>
      <span className="logo-mark" aria-hidden="true" style={{ borderColor: brand.theme.primary }}>
        <span style={{ borderColor: brand.theme.primary }} />
      </span>
      <span>{brand.name}</span>
    </div>
  )
}

