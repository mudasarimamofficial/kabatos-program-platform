'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Package, QrCode, Users } from 'lucide-react'
import { BrandLogo } from '@/components/customer/brand-logo'
import { brands } from '@/lib/mock/data'
import type { AdminView } from '@/lib/types'

export function AdminShell({
  children,
  title = 'Overview',
  active,
}: {
  children: React.ReactNode
  title?: string
  active?: AdminView
}) {
  const nav = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/admin' },
    { id: 'brands', label: 'Brands', icon: Package, href: '/admin/brands' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers' },
    { id: 'access', label: 'Access links', icon: QrCode, href: '/admin/access' },
  ] as const

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <BrandLogo brand={brands[0]} small />
        <nav aria-label="Admin navigation">
          {nav.map(({ id, label, icon: Icon, href }) => (
            <Link
              href={href}
              key={id}
              className={active === id ? 'active' : ''}
              aria-label={label}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <Link className="admin-customer-link" href="/comprex/dashboard">
          <ArrowLeft size={18} aria-hidden="true" /> Customer preview
        </Link>
      </aside>
      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">COMPREX ADMIN</span>
            <h1>{title}</h1>
          </div>
          <div className="admin-user">
            <span>Master admin</span>
            <div className="avatar" aria-label="Master admin">
              AD
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
