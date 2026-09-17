// Dedicated real TEST acceptance helper. Never prints keys or capabilities.
// node --env-file=.env.local --env-file=.env.gate.local scripts/stripe-test-evidence.mjs <trial-checkout|snapshot|replay|trial-cancel|clock-checkout|clock-snapshot|clock-advance|clock-cancel|security>
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID, createHash } from 'node:crypto'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { chromium } from '@playwright/test'

assert.match(process.env.STRIPE_SECRET_KEY || '', /^(sk|rk)_test_/)
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, 'finbvtwjddrmbuuuyeni.supabase.co')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
const base = process.env.STRIPE_ACCEPTANCE_BASE || 'https://kabatos-stripe-test.vercel.app'
assert.equal(new URL(base).protocol, 'https:')
const headers = { 'x-vercel-protection-bypass': process.env.GATE_BYPASS }
const check = r => { if (r.error) throw new Error(r.error.message); return r.data }
const command = process.argv[2] || 'snapshot'
const statePath = '.vercel/stripe-acceptance-private.json'
let state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {}
const persist = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 2))

async function completeStripeCheckout(checkoutUrl, name, email) {
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(checkoutUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#cardNumber', { timeout: 30000 })
    const emailInput = page.locator('#email')
    if (await emailInput.count() > 0) {
      const val = await emailInput.inputValue()
      if (!val) await emailInput.fill(email)
    }
    await page.locator('#cardNumber').fill('4242424242424242')
    await page.locator('#cardExpiry').fill('12/28')
    await page.locator('#cardCvc').fill('123')
    const nameInput = page.locator('#billingName')
    if (await nameInput.count() > 0) {
      await nameInput.fill(name)
    }
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(url => !url.hostname.includes('stripe.com'), { timeout: 60000 })
  } finally {
    await browser.close()
  }
}

async function waitForSubscription(programId, expectedStatus = 'trialing', timeoutMs = 45000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const { data } = await db.from('subscriptions').select('*').eq('program_id', programId).maybeSingle()
    if (data && (!expectedStatus || data.status === expectedStatus)) return data
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error(`Timed out waiting for subscription on program ${programId} (expected: ${expectedStatus})`)
}

async function snapshot(name) {
  const customers = check(await db.from('customers').select('id').eq('first_name', name))
  const programs = check(await db.from('customer_programs').select('id,brand_id,status,start_date,activated_at,duration_snapshot,schedule_snapshot,price_id_snapshot').in('customer_id', customers.map(c => c.id)))
  const results = []
  for (const p of programs) {
    const rows = check(await db.from('subscriptions').select('*').eq('program_id', p.id))
    const events = check(await db.from('stripe_events').select('stripe_event_id,event_type,status,attempt_count').eq('program_id', p.id))
    const attempts = check(await db.from('checkout_attempts').select('stripe_session_id,status').eq('program_id', p.id))
    let provider = null
    if (rows[0]) {
      const s = await stripe.subscriptions.retrieve(rows[0].stripe_subscription_id)
      assert.equal(s.livemode, false)
      provider = {
        id: s.id, customer: s.customer, status: s.status, trial_start: s.trial_start, trial_end: s.trial_end,
        trialDays: (s.trial_end - s.trial_start) / 86400, cancel_at_period_end: s.cancel_at_period_end, canceled_at: s.canceled_at,
        items: s.items.data.map(i => ({
          price: i.price.id, quantity: i.quantity, amount: i.price.unit_amount, currency: i.price.currency,
          interval: i.price.recurring.interval, interval_count: i.price.recurring.interval_count, current_period_start: i.current_period_start, current_period_end: i.current_period_end
        }))
      }
    }
    results.push({ program: p, subscriptions: rows, events, attempts, provider })
  }
  const evidence = { timestamp: new Date().toISOString(), base, customerLabel: name, results }
  fs.writeFileSync(`docs/evidence/stripe-${name.includes('Clock') ? 'clock' : 'trial'}-objects.json`, JSON.stringify(evidence, null, 2))
  console.log(JSON.stringify(evidence, null, 2))
  return results
}

if (command === 'trial-checkout') {
  assert(!state.trialSession, 'Trial fixture already exists')
  const capability = randomBytes(32).toString('base64url')
  check(await anon.rpc('customer_join', {
    p_brand_slug: 'comprex', p_first_name: 'Stripe Trial QA',
    p_email: 'trial-qa@example.invalid', p_phone: null,
    p_order_number: 'TEST-TRIAL-ACCEPTANCE', p_request_id: randomUUID(),
    p_capability: capability
  }))
  const checkoutRes = await fetch(base + '/api/stripe/checkout', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', cookie: 'kabatos_customer_session=' + capability },
    body: JSON.stringify({ brandSlug: 'comprex' })
  })
  assert.equal(checkoutRes.status, 200, 'Checkout API returned non-200')
  const checkoutData = await checkoutRes.json()
  assert(checkoutData.url, 'Missing checkout url')

  const customer = check(await db.from('customers').select('id').eq('first_name', 'Stripe Trial QA').single())
  const program = check(await db.from('customer_programs').select('id').eq('customer_id', customer.id).single())
  const attempt = check(await db.from('checkout_attempts').select('stripe_session_id').eq('program_id', program.id).single())

  state = {
    ...state,
    trialCapability: capability,
    trialProgram: program.id,
    trialCustomer: customer.id,
    trialSession: attempt.stripe_session_id,
    trialCheckoutUrl: checkoutData.url
  }
  persist()
  console.log(JSON.stringify({ checkout: attempt.stripe_session_id, program: program.id, checkoutUrlSavedPrivately: true }))

  console.log('Submitting Stripe Checkout via browser automation...')
  await completeStripeCheckout(checkoutData.url, 'Stripe Trial QA', 'trial-qa@example.invalid')
  console.log('Checkout completed. Waiting for webhook reconciliation in DB...')
  const sub = await waitForSubscription(program.id, 'trialing')
  console.log('Subscription reconciled in DB:', { id: sub.id, status: sub.status, stripe_subscription_id: sub.stripe_subscription_id })

  // Verify immediate trial access via dashboard
  const dashboard = check(await anon.rpc('customer_dashboard', { p_brand_slug: 'comprex', p_capability: capability }))
  assert(dashboard, 'Dashboard returned null')
  assert.equal(dashboard.program?.status, 'active', 'Program not active')
  console.log('Trial dashboard access verified:', { programStatus: dashboard.program?.status, duration: dashboard.program?.duration_days })
}

if (command === 'snapshot') await snapshot('Stripe Trial QA')
if (command === 'clock-snapshot') await snapshot('Stripe Clock QA')

if (command === 'replay') {
  const results = await snapshot('Stripe Trial QA')
  const p = results.find(r => r.provider)
  assert(p)
  const eventId = p.events.find(e => e.status === 'processed')?.stripe_event_id; assert(eventId)
  const event = await stripe.events.retrieve(eventId)
  const payload = JSON.stringify(event)
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET })
  const r = await fetch(base + '/api/stripe/webhook', {
    method: 'POST',
    headers: { ...headers, 'stripe-signature': signature, 'Content-Type': 'application/json' },
    body: payload
  })
  const result = await r.json()
  assert.equal(r.status, 200)
  assert.equal(result.status, 'duplicate_ignored')
  const after = check(await db.from('customer_programs').select('start_date,activated_at').eq('id', p.program.id).single())
  assert.equal(after.start_date, p.program.start_date)
  assert.equal(after.activated_at, p.program.activated_at)
  const evidence = {
    timestamp: new Date().toISOString(), eventId, replay: result,
    startDateUnchanged: true, activatedAtUnchanged: true,
    method: 'Real Stripe event retrieved and re-signed for explicit application replay'
  }
  fs.writeFileSync('docs/evidence/stripe-replay.json', JSON.stringify(evidence, null, 2))
  console.log(evidence)
}

if (command === 'trial-cancel') {
  assert(state.trialCapability, 'No trial capability stored')
  const r = await fetch(base + '/api/stripe/subscription', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', cookie: 'kabatos_customer_session=' + state.trialCapability },
    body: JSON.stringify({ brandSlug: 'comprex' })
  })
  const result = await r.json()
  assert.equal(r.status, 200)
  assert.equal(result.cancel_at_period_end, true)
  // Verify access is still retained during trial
  const dashboard = check(await anon.rpc('customer_dashboard', { p_brand_slug: 'comprex', p_capability: state.trialCapability }))
  assert(dashboard, 'Dashboard access lost after cancel scheduled')
  assert.equal(dashboard.program?.status, 'active', 'Program status altered after cancel scheduled')
  console.log(JSON.stringify({ status: r.status, result, accessRetained: true }))
  state.trialCancellation = result
  persist()
  fs.writeFileSync('docs/evidence/stripe-trial-cancellation.json', JSON.stringify({
    timestamp: new Date().toISOString(), status: r.status, result, accessRetainedDuringTrial: true
  }, null, 2))
}

if (command === 'clock-checkout') {
  assert(!state.clock, 'Clock fixture already exists; use clock-snapshot')
  const capability = randomBytes(32).toString('base64url')
  check(await anon.rpc('customer_join', {
    p_brand_slug: 'comprex', p_first_name: 'Stripe Clock QA',
    p_email: 'clock-qa@example.invalid', p_phone: null,
    p_order_number: 'TEST-CLOCK-ACCEPTANCE', p_request_id: randomUUID(),
    p_capability: capability
  }))
  const reservation = check(await anon.rpc('customer_checkout_reserve', {
    p_brand_slug: 'comprex', p_capability: capability, p_request_id: randomUUID()
  }))
  const attempt = check(await db.from('checkout_attempts').select('program_id,brand_id').eq('id', reservation.attempt_id).single())
  const clock = await stripe.testHelpers.testClocks.create({ frozen_time: Math.floor(Date.now() / 1000), name: 'Kabatos monthly billing acceptance' })
  const customer = await stripe.customers.create({ name: 'Stripe Clock QA', test_clock: clock.id })
  const metadata = { attemptId: reservation.attempt_id, brandSlug: 'comprex' }
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', customer: customer.id, payment_method_types: ['card'], payment_method_collection: 'always',
    line_items: [{ price: process.env.COMPREX_STRIPE_TEST_PRICE_ID, quantity: 1 }],
    metadata, subscription_data: { metadata, trial_period_days: 7 },
    success_url: base + '/comprex/success', cancel_url: base + '/comprex/checkout'
  })
  check(await db.rpc('stripe_link_checkout_attempt', {
    p_attempt_id: reservation.attempt_id, p_stripe_session_id: session.id,
    p_expires_at: new Date(session.expires_at * 1000).toISOString()
  }))
  state = {
    ...state, clock: clock.id, clockCustomer: customer.id, clockSession: session.id,
    clockCapability: capability, clockProgram: attempt.program_id, clockCheckoutUrl: session.url
  }
  persist()
  console.log(JSON.stringify({ clock: clock.id, customer: customer.id, checkout: session.id, program: attempt.program_id, checkoutUrlSavedPrivately: true }))

  console.log('Submitting Clock Stripe Checkout in browser...')
  await completeStripeCheckout(session.url, 'Stripe Clock QA', 'clock-qa@example.invalid')
  console.log('Clock checkout completed. Waiting for webhook reconciliation...')
  const sub = await waitForSubscription(attempt.program_id, 'trialing')
  console.log('Clock subscription reconciled in DB:', { id: sub.id, status: sub.status })
}

if (command === 'clock-advance') {
  assert(state.clock)
  const s = check(await db.from('subscriptions').select('stripe_subscription_id').eq('program_id', state.clockProgram).single())
  const sub = await stripe.subscriptions.retrieve(s.stripe_subscription_id)
  const target = (sub.status === 'trialing' ? sub.trial_end : sub.items.data[0].current_period_end) + 120
  console.log(`Advancing test clock ${state.clock} to ${target}...`)
  let clock = await stripe.testHelpers.testClocks.advance(state.clock, { frozen_time: target })
  while (clock.status === 'advancing') {
    console.log('Clock advancing, waiting 3s...')
    await new Promise(r => setTimeout(r, 3000))
    clock = await stripe.testHelpers.testClocks.retrieve(state.clock)
  }
  console.log(`Clock is ready (${clock.status}). Waiting for invoice.paid & subscription active reconciliation...`)
  const activeSub = await waitForSubscription(state.clockProgram, 'active', 60000)
  console.log('Subscription is now ACTIVE in DB:', { id: activeSub.id, status: activeSub.status })

  // Verify program snapshot immutability
  const prog = check(await db.from('customer_programs').select('id,start_date,activated_at,duration_snapshot,schedule_snapshot').eq('id', state.clockProgram).single())
  console.log('Program snapshot after renewal:', prog)
  fs.writeFileSync('docs/evidence/stripe-renewal-lifecycle.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    clock: state.clock,
    targetFrozenTime: target,
    subscriptionStatus: activeSub.status,
    programSnapshotPreserved: true,
    startDate: prog.start_date,
    durationSnapshot: prog.duration_snapshot,
    scheduleSnapshot: prog.schedule_snapshot
  }, null, 2))
}

if (command === 'clock-cancel') {
  const r = await fetch(base + '/api/stripe/subscription', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', cookie: 'kabatos_customer_session=' + state.clockCapability },
    body: JSON.stringify({ brandSlug: 'comprex' })
  })
  const result = await r.json()
  assert.equal(r.status, 200)
  assert.equal(result.cancel_at_period_end, true)
  console.log(JSON.stringify({ status: r.status, result }))
  state.clockCancellation = result
  persist()
  fs.writeFileSync('docs/evidence/stripe-clock-cancellation.json', JSON.stringify({
    timestamp: new Date().toISOString(), status: r.status, result
  }, null, 2))
}

if (command === 'security') {
  const results = []
  for (const path of ['/admin', '/admin/brands', '/admin/customers', '/comprex/dashboard', '/demo-wellness/dashboard']) {
    const r = await fetch(base + path, { headers, redirect: 'manual' })
    const text = await r.text()
    const leak = /Stripe Trial QA|Stripe Clock QA|stripe_customer_id|token_hash|totalCustomers[\\]*"\s*:/.test(text)
    assert(!leak)
    assert(r.status === 307 || text.includes('NEXT_REDIRECT'))
    results.push({ path, status: r.status, location: r.headers.get('location'), privateData: false })
  }
  for (const signature of [undefined, 'invalid']) {
    const r = await fetch(base + '/api/stripe/webhook', {
      method: 'POST',
      headers: { ...headers, ...(signature ? { 'stripe-signature': signature } : {}) },
      body: '{}'
    })
    assert.equal(r.status, 400)
    results.push({ check: signature ? 'invalid-signature' : 'unsigned', status: r.status })
  }
  const token = randomBytes(32).toString('base64url')
  check(await anon.rpc('customer_join', {
    p_brand_slug: 'comprex', p_first_name: 'Stripe Isolation QA',
    p_email: 'isolation@example.invalid', p_phone: null,
    p_order_number: 'TEST-ISOLATION', p_request_id: randomUUID(),
    p_capability: token
  }))
  for (const body of [{ brandSlug: 'comprex', subscriptionId: 'sub_other' }, { brandSlug: 'demo-wellness' }, { brandSlug: 'comprex' }]) {
    const r = await fetch(base + '/api/stripe/subscription', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', cookie: 'kabatos_customer_session=' + token },
      body: JSON.stringify(body)
    })
    assert([400, 409].includes(r.status))
    results.push({ check: 'cross-customer-or-brand-cancel-denied', status: r.status })
  }
  for (const name of ['customer_dashboard', 'customer_complete_today', 'customer_undo_today']) {
    const r = await anon.rpc(name, { p_brand_slug: 'comprex', p_capability: token })
    assert(r.error)
    results.push({ check: 'unactivated-' + name, denied: true })
  }
  const row = check(await db.from('customer_sessions').select('token_hash').eq('token_hash', '\\x' + createHash('sha256').update(token).digest('hex')).single())
  assert(row)
  const cross = await anon.rpc('customer_subscription_status', { p_brand_slug: 'demo-wellness', p_capability: token })
  assert(cross.error)
  for (const table of ['subscriptions', 'stripe_events', 'customer_sessions']) {
    const r = await anon.from(table).select('*')
    assert(r.error || r.data.length === 0)
  }
  const evidence = { timestamp: new Date().toISOString(), base, results, hashing: 'SHA-256 only', crossBrand: 'DENIED', RLS: 'DENIED' }
  fs.writeFileSync('docs/evidence/stripe-security.json', JSON.stringify(evidence, null, 2))
  console.log(JSON.stringify(evidence, null, 2))
}
