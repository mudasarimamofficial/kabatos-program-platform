'use client'

import React, { useState, useTransition } from 'react'
import { Check, CheckCircle2, ExternalLink, Package } from 'lucide-react'
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
  const [completed, setCompleted] = useState(
    customer.completedDays.includes(customer.currentDay)
  )
  const [isPending, startTransition] = useTransition()

  const summary = initialSummary ?? getSummary(brand, customer)
  const items = initialItems ?? getScheduleItems(brand, customer)
  const todayScheduled = summary.scheduledToday && !completed

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
      <main className="dashboard-main">
        <div className="dashboard-greeting">
          <div>
            <span className="eyebrow">YOUR {brand.name} PROGRAM</span>
            <h2>Welcome back, {customer.firstName}</h2>
          </div>
          <div className="avatar" aria-label={`${customer.firstName} profile`}>
            {customer.firstName.slice(0, 1)}C
          </div>
        </div>

        {summary.low && (
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
            <CheckCircle2 size={20} />
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
            <div className="progress-percent">{summary.progressPercent}%</div>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={summary.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${summary.progressPercent}% complete`}
          >
            <div
              style={{
                width: `${summary.progressPercent}%`,
                background: 'var(--brand-runtime)',
              }}
            />
          </div>
          <div className="progress-meta">
            <span>{summary.remainingDays} days remaining</span>
            <span>{brand.schedule.length} scheduled uses</span>
          </div>
        </section>

        {!summary.complete && (
          <section className="next-card" aria-label="Upcoming usage">
            <div className="next-icon">
              <Package size={22} />
            </div>
            <div className="next-content">
              <span className="eyebrow">{todayScheduled ? 'TODAY' : 'NEXT SCHEDULED USE'}</span>
              <h3>
                {todayScheduled
                  ? 'Your scheduled use'
                  : `Day ${summary.nextScheduledDay ?? brand.duration}`}
              </h3>
              <p>
                {todayScheduled
                  ? 'Mark today complete when you are ready.'
                  : 'Keep your program moving at a steady pace.'}
              </p>
            </div>
            {todayScheduled && (
              <Button onClick={handleMarkComplete} disabled={isPending}>
                <Check size={16} /> Mark complete
              </Button>
            )}
            {completed && (
              <Button variant="ghost" onClick={handleUndo} disabled={isPending}>
                Undo
              </Button>
            )}
          </section>
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
