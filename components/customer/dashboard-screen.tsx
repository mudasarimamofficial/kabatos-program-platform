'use client'

import React, { useState, useTransition } from 'react'
import { Check, CheckCircle2, ExternalLink, Moon, Package } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { Button } from './buttons'
import { getScheduleItems, getSummary } from '@/lib/program/utils'
import type { Brand, Customer, ProgramSummary, ScheduleItem } from '@/lib/types'

export function DashboardScreen({
  brand,
  customer,
  initialSummary,
  initialItems,
  onCompleteAction,
  onUndoAction,
}: {
  brand: Brand
  customer: Customer
  initialSummary?: ProgramSummary
  initialItems?: ScheduleItem[]
  onCompleteAction?: () => Promise<{ success: boolean }>
  onUndoAction?: () => Promise<{ success: boolean }>
}) {
  const isInitiallyCompleted = customer.completedDays.includes(customer.currentDay)
  const [completed, setCompleted] = useState(isInitiallyCompleted)
  const [isPending, startTransition] = useTransition()

  const summary = initialSummary ?? getSummary(brand, customer)
  const baseItems = initialItems ?? getScheduleItems(brand, customer)

  // Dynamic schedule item state reflecting local toggle
  const items = baseItems.map((item) => {
    if (item.day === customer.currentDay && brand.schedule.includes(item.day)) {
      return {
        ...item,
        state: completed ? ('completed' as const) : ('scheduled' as const),
      }
    }
    return item
  })

  // Dynamic progress percentage
  const completedCount = items.filter((it) => it.state === 'completed').length
  const dynamicPercent = Math.min(100, Math.round((completedCount / brand.schedule.length) * 100))
  const todayIsScheduled = brand.schedule.includes(customer.currentDay)

  const handleMarkComplete = () => {
    setCompleted(true)
    if (onCompleteAction) {
      startTransition(async () => {
        await onCompleteAction()
      })
    }
  }

  const handleUndo = () => {
    setCompleted(false)
    if (onUndoAction) {
      startTransition(async () => {
        await onUndoAction()
      })
    }
  }

  return (
    <CustomerShell brand={brand}>
      <main className="dashboard-main motion-card-reveal">
        <div className="dashboard-greeting">
          <div>
            <span className="eyebrow">YOUR {brand.name} PROGRAM</span>
            <h2>Welcome back, {customer.firstName}</h2>
            <div className="day-badge">
              Day {summary.currentDay} of {brand.duration}
            </div>
          </div>
          <div className="avatar" aria-label={`${customer.firstName} profile`}>
            {customer.firstName.slice(0, 1)}C
          </div>
        </div>

        {summary.low && !summary.complete && (
          <div className="notice notice-warning" role="status">
            <div>
              <strong>Your product may be running low</strong>
              <span>Approximately {summary.remainingDays} days remaining in this program.</span>
            </div>
            {brand.reorderUrl && (
              <Button variant="dark" href={brand.reorderUrl}>
                Reorder product <ExternalLink size={15} />
              </Button>
            )}
          </div>
        )}

        {summary.complete && (
          <div className="notice notice-success" role="status">
            <CheckCircle2 size={22} className="motion-checkmark" />
            <div>
              <strong>Program complete</strong>
              <span>
                You completed your {brand.duration}-day {brand.name} program.
              </span>
            </div>
            {brand.reorderUrl && (
              <Button variant="outline" href={brand.reorderUrl}>
                Reorder product <ExternalLink size={15} />
              </Button>
            )}
          </div>
        )}

        <section className="progress-card" aria-label="Program progress">
          <div className="progress-top">
            <div>
              <span className="eyebrow">PROGRAM SUMMARY</span>
              <div className="day-number">
                Day {summary.currentDay} <span>of {brand.duration}</span>
              </div>
            </div>
            <div className="progress-percent">{dynamicPercent}%</div>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={dynamicPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${dynamicPercent}% complete`}
          >
            <div
              style={{
                width: `${dynamicPercent}%`,
                background: 'var(--brand-runtime)',
                transition: 'width 360ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
          <div className="progress-meta">
            <span>{summary.remainingDays} days remaining</span>
            <span>{brand.schedule.length} scheduled uses</span>
          </div>
        </section>

        {!summary.complete && (
          <>
            {todayIsScheduled ? (
              completed ? (
                <section className="next-card completed-card" aria-label="Completed usage">
                  <div className="next-icon">
                    <Check size={22} className="motion-checkmark" />
                  </div>
                  <div className="next-content">
                    <span className="eyebrow" style={{ color: 'var(--success)' }}>
                      COMPLETED TODAY
                    </span>
                    <h3>Usage logged! Great job keeping your momentum going.</h3>
                    <p>You&apos;ve completed today&apos;s routine. Rest well tonight.</p>
                  </div>
                  <Button variant="ghost" onClick={handleUndo} disabled={isPending}>
                    Undo
                  </Button>
                </section>
              ) : (
                <section className="next-card" aria-label="Upcoming usage">
                  <div className="next-icon">
                    <Package size={22} />
                  </div>
                  <div className="next-content">
                    <span className="eyebrow">TODAY</span>
                    <h3>Your scheduled use</h3>
                    <p>Take ~1 teaspoon in warm water before bedtime.</p>
                  </div>
                  <Button onClick={handleMarkComplete} disabled={isPending}>
                    <Check size={16} /> Mark complete
                  </Button>
                </section>
              )
            ) : (
              <section className="next-card rest-card" aria-label="Rest day">
                <div className="next-icon">
                  <Moon size={22} />
                </div>
                <div className="next-content">
                  <span className="eyebrow">REST DAY</span>
                  <h3>Nothing scheduled today</h3>
                  <p>
                    Your next usage is Day {summary.nextScheduledDay ?? brand.duration}. Keep hydrated and rest well.
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        <section className="timeline-card">
          <span className="eyebrow">PROGRAM SCHEDULE</span>
          <h3>Usage history</h3>
          <div className="timeline" aria-label="Program schedule">
            {items.map((item) => (
              <div className={`timeline-item ${item.state}`} key={item.day}>
                <span aria-hidden="true">
                  {item.state === 'completed' ? '✓' : item.state === 'scheduled' ? '•' : '○'}
                </span>
                <strong>Day {item.day}</strong>
                <small>{item.state}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    </CustomerShell>
  )
}
