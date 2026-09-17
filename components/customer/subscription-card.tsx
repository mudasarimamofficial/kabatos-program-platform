'use client'
import { useState } from 'react'
import type { SubscriptionState } from '@/lib/stripe/plan'
import { Button } from './buttons'

export function SubscriptionCard({ brandSlug, initialState }: { brandSlug: string; initialState: SubscriptionState }) {
  const [state, setState] = useState(initialState)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!state.required) return null
  const end = state.status === 'trialing' ? state.trial_end : state.current_period_end
  const date = end ? new Date(end).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }) + ' UTC' : 'the end of your authorized period'
  const status = state.cancel_at_period_end && state.access ? 'Cancellation scheduled' : state.status === 'trialing' ? 'Free trial' : state.status === 'active' ? 'Active' : state.status === 'canceled' ? 'Canceled' : state.status ? 'Payment issue' : 'Awaiting activation'
  async function cancel() {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/stripe/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brandSlug }) })
      if (!res.ok) throw new Error()
      setState(await res.json()); setConfirm(false)
    } catch { setError('Cancellation could not be confirmed. Please retry.') }
    finally { setBusy(false) }
  }
  return <section className="timeline-card" aria-label="Subscription">
    <h3>{status}</h3>
    <p>{state.cancel_at_period_end ? `Your subscription will not renew. Access ends ${date}.` : end ? `Current ${state.status === 'trialing' ? 'trial' : 'billing period'} ends ${date}.` : 'Complete checkout to activate tracking.'}</p>
    {error && <p role="alert">{error}</p>}
    {state.status && !['canceled','incomplete_expired'].includes(state.status) && !state.cancel_at_period_end && (confirm ?
      <div role="group" aria-label="Confirm subscription cancellation">
        <p>You’ll keep access until {date}. Your subscription will not renew after that date.</p>
        <Button onClick={cancel} disabled={busy}>{busy ? 'Confirming…' : 'Confirm cancellation'}</Button>
        <Button variant="ghost" onClick={() => setConfirm(false)} disabled={busy}>Keep subscription</Button>
      </div> : <Button variant="outline" onClick={() => setConfirm(true)}>Cancel subscription</Button>)}
  </section>
}
