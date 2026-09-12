'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, QrCode } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { Metric } from './metric-card'
import { customers as mockCustomers, metrics as mockMetrics } from '@/lib/mock/data'
import type { AdminMetrics, Customer } from '@/lib/types'

export function AdminOverview({
  metrics = mockMetrics,
  customers = mockCustomers,
}: {
  metrics?: AdminMetrics
  customers?: Customer[]
}) {
  return (
    <AdminShell active="overview">
      <div className="admin-page">
        <div className="metric-grid">
          <Metric label="Total brands" value={String(metrics.totalBrands)} note="Configured programs" />
          <Metric label="Total customers" value={String(metrics.totalCustomers)} note="Across all brands" />
          <Metric label="Active programs" value={String(metrics.activePrograms)} note="Across all brands" />
          <Metric
            label="Active subscriptions"
            value={String(metrics.activeSubscriptions)}
            note="Current subscriptions"
          />
        </div>

        <div className="admin-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">RECENT CUSTOMERS</span>
                <h2>Latest program starts</h2>
              </div>
              <Link className="text-link" href="/admin/customers">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {customers.slice(0, 5).map((customer) => (
              <div className="activity-row" key={customer.id}>
                <div className="avatar light">{customer.firstName[0]}C</div>
                <div>
                  <strong>{customer.firstName}</strong>
                  <span>Started a {customer.brandSlug} program</span>
                </div>
                <time>{customer.startDate}</time>
              </div>
            ))}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">QUICK ACTIONS</span>
                <h2>Keep things moving</h2>
              </div>
            </div>
            <Link className="quick-action" href="/admin/brands/new">
              <Plus size={18} />
              <span>
                <strong>Add a brand</strong>
                <small>Set up a new product program</small>
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link className="quick-action" href="/admin/access">
              <QrCode size={18} />
              <span>
                <strong>Manage access links</strong>
                <small>Copy or download a QR code</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
