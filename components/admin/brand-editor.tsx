'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { AdminShell } from './admin-shell'
import { addScheduleDay, removeScheduleDay } from '@/lib/program/utils'
import type { Brand, BrandForm } from '@/lib/types'

function initialForm(brand?: Brand): BrandForm {
  return {
    name: brand?.name ?? '',
    logo: brand?.logo ?? '',
    primary: brand?.theme.primary ?? '#F07106',
    productName: brand?.productName ?? '',
    duration: brand?.duration ?? 14,
    schedule: brand?.schedule ?? [1, 3, 5, 7],
    reorderUrl: brand?.reorderUrl ?? '',
  }
}

export function BrandEditor({
  brand,
  mode = 'edit',
  onSave,
}: {
  brand?: Brand
  mode?: 'create' | 'edit'
  onSave?: (form: BrandForm) => Promise<{ success: boolean; error?: string }>
}) {
  const [form, setForm] = useState<BrandForm>(() => initialForm(brand))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ reorderUrl?: string; schedule?: string; general?: string }>({})

  const update = <K extends keyof BrandForm>(key: K, value: BrandForm[K]) => {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const duration = Math.max(1, Math.floor(Number(form.duration) || 1))
  const days = form.schedule.filter((day) => day <= duration)

  const validate = () => {
    const next: typeof errors = {}
    try {
      if (!form.reorderUrl.trim()) return validateSchedule()
      const url = new URL(form.reorderUrl)
      if (url.protocol !== 'https:') next.reorderUrl = 'Use a secure https:// URL.'
    } catch {
      next.reorderUrl = 'Enter a valid https:// URL.'
    }
    if (!days.length) next.schedule = 'Select at least one day within the duration.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateSchedule = () => {
    const next = days.length ? {} : { schedule: 'Select at least one day within the duration.' }
    setErrors(next)
    return days.length > 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    setErrors({})

    try {
      if (onSave) {
        const res = await onSave({ ...form, schedule: days })
        if (!res.success) {
          setErrors({ general: res.error || 'Failed to save brand.' })
          setSaving(false)
          return
        }
      }
      setSaved(true)
    } catch {
      setErrors({ general: 'Failed to save brand. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell title={mode === 'create' ? 'Create brand' : 'Edit brand'} active="brands">
      <div className="admin-page form-page">
        <Link className="back-link" href="/admin/brands">
          <ArrowLeft size={16} /> Back to brands
        </Link>
        <form className="admin-form-wrap" onSubmit={submit}>
          <div className="form-header">
            <div>
              <h2>{mode === 'create' ? 'New brand' : brand?.name}</h2>
              <p>
                {mode === 'create'
                  ? 'Create a new program configuration.'
                  : "Update this brand's program settings."}
              </p>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saved
                ? 'Changes saved.'
                : saving
                ? 'Saving…'
                : mode === 'create'
                ? 'Create brand'
                : 'Save changes'}{' '}
              <Check size={17} />
            </button>
          </div>

          {errors.general && (
            <div className="notice notice-warning" role="alert">
              {errors.general}
            </div>
          )}

          <div className="edit-grid">
            <section className="panel admin-form">
              <span className="eyebrow">BRAND DETAILS</span>
              <label>
                Brand name
                <input
                  required
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                />
              </label>
              <label>
                Brand logo
                <input
                  value={form.logo}
                  onChange={(event) => update('logo', event.target.value)}
                  placeholder="Optional brand-slug/logo.png storage path"
                />
              </label>
              <label>
                Main brand color
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: form.primary || '#F07106',
                      border: '1px solid var(--line)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <input
                    required
                    value={form.primary}
                    onChange={(event) => update('primary', event.target.value)}
                    placeholder="#F07106"
                  />
                </div>
              </label>
              <label>
                Product name
                <input
                  required
                  value={form.productName}
                  onChange={(event) => update('productName', event.target.value)}
                />
              </label>
              <label>
                Reorder URL
                <input
                  value={form.reorderUrl}
                  onChange={(event) => update('reorderUrl', event.target.value)}
                  aria-invalid={Boolean(errors.reorderUrl)}
                  aria-describedby="reorder-error"
                />
                {errors.reorderUrl && (
                  <span id="reorder-error" className="field-error" role="alert">
                    {errors.reorderUrl}
                  </span>
                )}
              </label>
            </section>

            <section className="panel admin-form">
              <span className="eyebrow">PROGRAM SCHEDULE</span>
              <label>
                Duration (days)
                <input
                  type="number"
                  value={form.duration}
                  min="1"
                  onChange={(event) => update('duration', Number(event.target.value))}
                />
              </label>
              <div>
                <label>Scheduled usage days</label>
                <div className="day-chips">
                  {Array.from({ length: duration }, (_, index) => index + 1).map((day) => (
                    <button
                      type="button"
                      aria-pressed={days.includes(day)}
                      key={day}
                      className={days.includes(day) ? 'selected' : ''}
                      onClick={() =>
                        update(
                          'schedule',
                          days.includes(day)
                            ? removeScheduleDay(days, day)
                            : addScheduleDay(days, day, duration)
                        )
                      }
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.schedule && (
                  <p className="field-error" role="alert">
                    {errors.schedule}
                  </p>
                )}
              </div>
              <p className="form-hint">
                Changing duration removes scheduled days outside the valid range.
              </p>
            </section>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
