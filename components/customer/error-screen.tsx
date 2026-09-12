'use client'

import React from 'react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

export function ErrorScreen({
  brand,
  title = 'This access link is unavailable',
  message = 'Check the link and try again, or contact your program support team.',
}: {
  brand: Brand
  title?: string
  message?: string
}) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main centered">
        <div className="success-icon error-icon" aria-hidden="true">
          !
        </div>
        <h2>{title}</h2>
        <p className="body-copy">{message}</p>
        <Button href={`/${brand.slug}`}>Return to welcome</Button>
      </main>
    </CustomerShell>
  )
}
