'use client'

import React from 'react'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { BrandLogo } from '@/components/customer/brand-logo'
import { brands as mockBrands } from '@/lib/mock/data'
import type { Brand } from '@/lib/types'

export function BrandRoster({ brands = mockBrands }: { brands?: Brand[] }) {
  return (
    <AdminShell title="Brands" active="brands">
      <div className="admin-page">
        <div className="page-actions">
          <p>Manage the programs customers can access.</p>
          <Link className="btn btn-primary" href="/admin/brands/new">
            <Plus size={17} /> Add brand
          </Link>
        </div>
        <div className="brand-grid">
          {brands.map((brand) => (
            <div className="brand-card" key={brand.slug}>
              <div className="brand-card-top">
                <BrandLogo brand={brand} small />
                <span className={`status-pill ${brand.status === 'draft' ? 'draft' : 'live'}`}>
                  {brand.status}
                </span>
              </div>
              <h2>{brand.name}</h2>
              <p>{brand.productName}</p>
              <div className="brand-meta">
                <span>{brand.duration} days</span>
                <span>{brand.schedule.length} uses</span>
              </div>
              <Link className="card-edit" href={`/admin/brands/${brand.slug}`}>
                <Package size={15} /> Edit brand
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
