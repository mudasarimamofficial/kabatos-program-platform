'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ButtonVariant } from '@/lib/types'

export function BackLink({ href, children = 'Back' }: { href: string; children?: React.ReactNode }) {
  return (
    <Link className="back-link" href={href}>
      <ArrowLeft size={16} aria-hidden="true" /> {children}
    </Link>
  )
}

function isSafeUrl(url?: string): boolean {
  if (!url) return false
  if (url.startsWith('#') || url.startsWith('/')) return true
  try {
    const parsed = new URL(url, 'https://kabatos-internal.local')
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const className = `btn btn-${variant}`
  if (href && isSafeUrl(href)) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }
  return (
    <button className={className} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  )
}
