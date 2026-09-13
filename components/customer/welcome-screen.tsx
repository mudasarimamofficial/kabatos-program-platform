'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Moon, Package, Sparkles } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import type { Brand } from '@/lib/types'

export function WelcomeScreen({ brand }: { brand: Brand }) {
  return (
    <CustomerShell brand={brand}>
      <main className="customer-main welcome-main motion-card-reveal">
        <div className="eyebrow">YOUR WELLNESS PROGRAM</div>
        <h1>
          Your program,<br />
          <em>made simple.</em>
        </h1>
        <p className="lead">
          Welcome to your wellness journey. Simple routine. Clear progress. Easy reordering.
        </p>

        {brand.productImage ? (
          <div className="product-hero-container">
            <div className="product-hero-glow" aria-hidden="true" />
            <Image
              src={brand.productImage}
              alt={`${brand.name} ${brand.productName}`}
              width={220}
              height={300}
              className="product-hero-image motion-float-gentle"
              priority
            />
            <div className="product-hero-badge">
              <strong>{brand.name} · {brand.productName}</strong>
              <span>{brand.duration}-day structured program</span>
            </div>
          </div>
        ) : (
          <div className="product-visual">
            <Package size={48} strokeWidth={1.25} aria-hidden="true" style={{ color: 'var(--brand-runtime)' }} />
            <div>
              <strong>{brand.name}</strong>
              <span>{brand.productName} · {brand.duration}-day program</span>
            </div>
          </div>
        )}

        <div className="welcome-pillars" aria-label="Program pillars">
          <div className="pillar-item">
            <div className="pillar-icon" aria-hidden="true">
              <Moon size={18} />
            </div>
            <div>
              <strong>Daily Routine</strong>
              <span>Evening habit</span>
            </div>
          </div>
          <div className="pillar-item">
            <div className="pillar-icon" aria-hidden="true">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <strong>Clear Progress</strong>
              <span>Daily tracker</span>
            </div>
          </div>
          <div className="pillar-item">
            <div className="pillar-icon" aria-hidden="true">
              <Sparkles size={18} />
            </div>
            <div>
              <strong>Natural Comfort</strong>
              <span>Gentle rhythm</span>
            </div>
          </div>
        </div>

        <Button href={`/${brand.slug}/start`}>
          Start My Program <ArrowRight size={18} />
        </Button>
        <p className="microcopy">
          Already started?{' '}
          <Link className="inline-link" href={`/${brand.slug}/dashboard`}>
            View your program
          </Link>
        </p>
      </main>
    </CustomerShell>
  )
}

