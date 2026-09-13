'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { CustomerShell } from './customer-shell'
import { BackLink, Button } from './buttons'
import { joinCustomerProgramAction } from '@/lib/services/customer-actions'
import type { Brand, ContactMethod } from '@/lib/types'

export function StartScreen({
  brand,
  onJoin,
}: {
  brand: Brand
  onJoin?: (data: {
    firstName: string
    email?: string
    phone?: string
    orderNumber?: string
  }) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [method, setMethod] = useState<ContactMethod>('email')
  const [firstName, setFirstName] = useState('')
  const [contact, setContact] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailValid = /.+@.+\..+/.test(contact)
  const phoneValid = contact.replace(/\D/g, '').length >= 7

  const errors = {
    firstName: firstName.trim().length < 2 ? 'Enter at least 2 characters.' : '',
    contact:
      method === 'email'
        ? emailValid
          ? ''
          : 'Enter a valid email address.'
        : phoneValid
        ? ''
        : 'Enter a valid phone number.',
  }

  const valid = !errors.firstName && !errors.contact

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTouched({ firstName: true, contact: true })
    if (!valid) return

    setSubmitting(true)
    setServerError('')

    try {
      const joinPayload = {
        firstName,
        email: method === 'email' ? contact : undefined,
        phone: method === 'phone' ? contact : undefined,
        orderNumber: orderNumber || undefined,
      }
      const res = onJoin
        ? await onJoin(joinPayload)
        : await joinCustomerProgramAction({ ...joinPayload, brandSlug: brand.slug })

      if (!res.success) {
        setServerError(res.error || 'Failed to initialize program.')
        setSubmitting(false)
        return
      }

      if (typeof window !== 'undefined') {
        window.location.assign(`/${brand.slug}/activate`)
      } else {
        router.push(`/${brand.slug}/activate`)
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.location.assign(`/${brand.slug}/activate`)
      } else {
        router.push(`/${brand.slug}/activate`)
      }
    }
  }

  return (
    <CustomerShell brand={brand}>
      <main className="customer-main motion-card-reveal">
        <BackLink href={`/${brand.slug}`} />
        <div className="progress-steps" aria-label="Onboarding step 1 of 3">
          <span className="active">1</span>
          <i />
          <span>2</span>
          <i />
          <span>3</span>
        </div>
        <h2>Let&apos;s get you set up.</h2>
        <p className="body-copy">Just a few details so we can save your program progress.</p>
        <form className="form-stack" onSubmit={submit} noValidate>
          {serverError && (
            <div className="notice notice-warning" role="alert">
              {serverError}
            </div>
          )}
          <label htmlFor="first-name">
            First name
            <input
              id="first-name"
              name="firstName"
              autoComplete="given-name"
              autoCapitalize="words"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, firstName: true }))}
              aria-invalid={Boolean(touched.firstName && errors.firstName)}
              aria-describedby="first-name-error"
              placeholder="e.g. Sarah"
            />
            {touched.firstName && errors.firstName && (
              <span id="first-name-error" className="field-error" role="alert">
                {errors.firstName}
              </span>
            )}
          </label>
          <fieldset className="contact-fieldset">
            <legend>How should we reach you?</legend>
            <div className="segmented" role="radiogroup" aria-label="Contact method">
              <button
                type="button"
                role="radio"
                aria-checked={method === 'email'}
                className={method === 'email' ? 'selected' : ''}
                onClick={() => setMethod('email')}
              >
                Email
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={method === 'phone'}
                className={method === 'phone' ? 'selected' : ''}
                onClick={() => setMethod('phone')}
              >
                Phone
              </button>
            </div>
            <input
              id="contact"
              name={method === 'email' ? 'email' : 'phone'}
              type={method === 'email' ? 'email' : 'tel'}
              inputMode={method === 'email' ? 'email' : 'tel'}
              autoComplete={method === 'email' ? 'email' : 'tel'}
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, contact: true }))}
              aria-invalid={Boolean(touched.contact && errors.contact)}
              aria-describedby="contact-error"
              placeholder={method === 'email' ? 'you@example.com' : '(555) 000-0000'}
            />
            {touched.contact && errors.contact && (
              <span id="contact-error" className="field-error" role="alert">
                {errors.contact}
              </span>
            )}
          </fieldset>
          <label htmlFor="order-number">
            Order number <span className="optional">Optional</span>
            <input
              id="order-number"
              name="orderNumber"
              autoComplete="off"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="e.g. #CX-1042"
            />
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Continue'} <ArrowRight size={18} />
          </Button>
        </form>
      </main>
    </CustomerShell>
  )
}
