'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { customers as mockCustomers } from '@/lib/mock/data'
import type { Customer } from '@/lib/types'

export function CustomerRoster({ customers = mockCustomers }: { customers?: Customer[] }) {
  const [query, setQuery] = useState('')
  const filtered = customers.filter((customer) =>
    `${customer.firstName} ${customer.email}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AdminShell title="Customers" active="customers">
      <div className="admin-page">
        <div className="page-actions">
          <p>View and support every customer program.</p>
          <div className="search-box">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search customers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers"
            />
          </div>
        </div>

        <section className="panel table-panel">
          <div className="table-header">
            <span>Customer</span>
            <span>Brand</span>
            <span>Progress</span>
            <span>Program</span>
            <span>Subscription</span>
          </div>
          {filtered.map((customer) => (
            <Link className="table-row" href={`/admin/customers/${customer.id}`} key={customer.id}>
              <div className="customer-cell">
                <div className="avatar light">{customer.firstName[0]}C</div>
                <span>
                  <strong>{customer.firstName}</strong>
                  <small>{customer.email}</small>
                </span>
              </div>
              <span>{customer.brandSlug}</span>
              <span>Day {customer.currentDay}</span>
              <span className="status-pill live">{customer.programStatus}</span>
              <span>{customer.subscriptionStatus}</span>
            </Link>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
