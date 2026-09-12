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
  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    )
  }
  return (
    <button className={className} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  )
}
