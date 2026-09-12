'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { Metric } from './metric-card'
import { brands as mockBrands } from '@/lib/mock/data'
import type { Brand, Customer } from '@/lib/types'

export function CustomerDetail({
  customer,
  brand: passedBrand,
}: {
  customer: Customer
  brand?: Brand
}) {
  const brand = passedBrand ?? mockBrands.find((b) => b.slug === customer.brandSlug) ?? mockBrands[0]

  return (
    <AdminShell title="Customer detail" active="customers">
      <div className="admin-page">
        <Link className="back-link" href="/admin/customers">
          <ArrowLeft size={16} /> Back to customers
        </Link>
        <div className="detail-head">
          <div className="avatar large-avatar">{customer.firstName[0]}C</div>
          <div>
            <h2>{customer.firstName}</h2>
            <p>
              {customer.email || customer.phone} · {brand.name}
              {customer.orderNumber ? ` · Order: ${customer.orderNumber}` : ''}
            </p>
          </div>
          <span className="status-pill live">{customer.programStatus}</span>
        </div>
        <div className="detail-grid">
          <Metric
            label="Current day"
            value={`${customer.currentDay} / ${brand.duration}`}
            note={`${Math.round((customer.currentDay / brand.duration) * 100)}% complete`}
          />
          <Metric
            label="Subscription"
            value={customer.subscriptionStatus}
            note="Separate from program status"
          />
          <section className="panel usage-panel">
            <span className="eyebrow">USAGE HISTORY</span>
            <h2>Program schedule</h2>
            {brand.schedule.map((day) => (
              <div className="usage-row" key={day}>
                <span className="schedule-check">
                  {customer.completedDays.includes(day) ? <Check size={14} /> : '○'}
                </span>
                <span>Day {day}</span>
                <small>{customer.completedDays.includes(day) ? 'Completed' : 'Upcoming'}</small>
              </div>
            ))}
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
