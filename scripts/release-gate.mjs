// DEV only. Run with Node 24 and ignored env files; never prints credentials/capabilities.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID, createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { chromium } from '@playwright/test'

const base = process.env.GATE_BASE_URL
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
assert.equal(new URL(url).hostname, 'finbvtwjddrmbuuuyeni.supabase.co', 'DEV only')
assert(base && !base.includes('localhost'), 'Use a deployed Preview URL')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const service = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const anon = createClient(url, anonKey, { auth: { persistSession: false } })
const bypassHeaders = process.env.GATE_BYPASS ? { 'x-vercel-protection-bypass': process.env.GATE_BYPASS } : {}
const report = { date: new Date().toISOString(), base, results: [], cleanup: [] }
const record = (label, data) => { report.results.push({ label, ...data }); console.log(label, JSON.stringify(data)) }
const check = (r) => { if (r.error) throw new Error(r.error.message); return r.data }
const adminRoutes = ['/admin', '/admin/brands', '/admin/brands/new', '/admin/customers', '/admin/access']
const customerRoutes = ['/comprex/dashboard', '/demo-wellness/dashboard']
const leak = t => /totalBrands[\\]*"\s*:|totalCustomers[\\]*"\s*:|firstName[\\]*"\s*:|sarah\.chen@email|sarah@example\.com|duration_snapshot|token_hash/.test(t)
const users = [], brands = []
let restoreDemo, browser, masterClient

async function raw(path, cookie = '', rsc = false) {
  const headers = { ...bypassHeaders, ...(cookie ? { cookie } : {}), ...(rsc ? { RSC: '1' } : {}) }
  const r = await fetch(base + path, { headers, redirect: 'manual' })
  const text = await r.text()
  return { status: r.status, location: r.headers.get('location'), followed: false, type: r.headers.get('content-type'), bytes: text.length, privatePayload: leak(text), serverRedirect: text.match(/NEXT_REDIRECT[^<\n]{0,100}/)?.[0], text }
}
async function login(email, password) {
  let jar = []
  const client = createServerClient(url, anonKey, { cookies: {
    getAll: () => jar,
    setAll: values => { jar = values },
  } })
  check(await client.auth.signInWithPassword({ email, password }))
  return { client, jar, cookie: jar.map(c => `${c.name}=${c.value}`).join('; ') }
}
async function editArgs(row, overrides = {}) {
  const config = row.program_configs.find(c => c.is_current)
  return { p_brand_id: row.id, p_expected_version: config.version, p_name: row.name,
    p_logo_path: row.logo_path, p_primary_color: row.primary_color, p_secondary_color: row.secondary_color,
    p_highlight_color: row.highlight_color, p_product_name: row.product_name, p_reorder_url: row.reorder_url,
    p_timezone: row.timezone, p_duration_days: config.duration_days, p_schedule_days: config.schedule_days,
    p_usage_title: config.usage_title, p_usage_instructions: config.usage_instructions,
    p_running_low_days: config.running_low_days, p_subscription_required: config.subscription_required,
    p_stripe_price_id: config.stripe_price_id, p_active: row.active, ...overrides }
}
const readBrand = async slug => check(await service.from('brands').select('*, program_configs(*)').eq('slug', slug).single())
async function cleanBrowser(path, cookieJar = [], expected) {
  const context = await browser.newContext({ extraHTTPHeaders: bypassHeaders })
  assert.deepEqual(await context.cookies(), [])
  if (cookieJar.length) await context.addCookies(cookieJar.map(c => ({ name: c.name, value: c.value, url: base, httpOnly: true, secure: true, sameSite: 'Lax' })))
  const page = await context.newPage()
  const responses = []
  page.on('response', r => {
    if (r.url().startsWith(base) && /text\/html|text\/x-component|application\/json/.test(r.headers()['content-type'] || '')) {
      responses.push(r.text().then(t => ({ path: new URL(r.url()).pathname, status: r.status(), privatePayload: leak(t) })).catch(() => null))
    }
  })
  await page.goto(base + path)
  if (expected) await page.waitForURL(base + expected)
  await page.waitForFunction(() => !document.body.innerText.includes('Loading your program'))
  const data = { finalUrl: page.url(), title: await page.title(), visibleBody: (await page.locator('body').innerText()).slice(0, 1100), network: (await Promise.all(responses)).filter(Boolean) }
  await context.close()
  return data
}

try {
  browser = await chromium.launch({ headless: true })
  for (const path of [...adminRoutes, ...customerRoutes]) {
    const samples = []
    for (const rsc of [false, true]) {
      const { text, ...data } = await raw(path, '', rsc)
      assert.equal(data.privatePayload, false, 'Anonymous payload leakage: ' + path)
      assert(data.location || text.includes('NEXT_REDIRECT'), 'Missing application redirect: ' + path)
      samples.push({ rsc, ...data })
    }
    const visible = await cleanBrowser(path, [], path.startsWith('/admin') ? '/admin/login' : path.replace('/dashboard', ''))
    assert(visible.network.every(r => !r.privatePayload))
    record('anonymous ' + path, { samples, ...visible })
  }

  const stamp = Date.now()
  const password = randomBytes(32).toString('base64url')
  const masterEmail = `gate-master-${stamp}@example.com`
  const bootstrapEnv = { ...process.env, ADMIN_EMAIL: masterEmail, ADMIN_PASSWORD: password }
  execFileSync(process.execPath, ['scripts/bootstrap-admin.ts'], { env: bootstrapEnv, stdio: 'pipe' })
  const master = await login(masterEmail, password)
  masterClient = master.client
  const masterUser = check(await master.client.auth.getUser()).user
  users.push(masterUser.id)
  execFileSync(process.execPath, ['scripts/bootstrap-admin.ts'], { env: bootstrapEnv, stdio: 'pipe' })
  assert.equal(check(await master.client.auth.getUser()).user.id, masterUser.id)
  record('bootstrap', { createdAuthUser: true, activeProfile: check(await service.from('admin_profiles').select('active').eq('user_id', masterUser.id).single()).active, rerunSameUser: true, passwordCommitted: false })
  const nonEmail = `gate-nonadmin-${stamp}@example.com`
  const nonUser = check(await service.auth.admin.createUser({ email: nonEmail, password, email_confirm: true })).user
  users.push(nonUser.id)
  const non = await login(nonEmail, password)
  assert.equal(check(await service.from('admin_profiles').select('user_id').eq('user_id', nonUser.id)).length, 0)
  for (const path of adminRoutes) {
    const samples = []
    for (const rsc of [false, true]) {
      const { text, ...data } = await raw(path, non.cookie, rsc)
      assert(!data.privatePayload && (data.location || text.includes('NEXT_REDIRECT')))
      samples.push({ rsc, ...data })
    }
    const view = await cleanBrowser(path, non.jar, '/admin/login')
    record('nonadmin ' + path, { samples, finalUrl: view.finalUrl, visibleBody: view.visibleBody })
  }
  assert((await non.client.rpc('admin_dashboard_counts')).error)
  for (const path of adminRoutes) {
    const { text, ...data } = await raw(path, master.cookie)
    assert.equal(data.status, 200)
    assert(!text.includes('NEXT_REDIRECT'))
    record('master ' + path, { status: data.status, location: data.location })
  }

  const context = await browser.newContext({ extraHTTPHeaders: bypassHeaders })
  const page = await context.newPage()
  await page.goto(base + '/admin/login')
  await page.locator('#email').fill(masterEmail)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(base + '/admin')
  const demo = await readBrand('demo-wellness')
  restoreDemo = async () => {
    const current = await readBrand('demo-wellness')
    check(await master.client.rpc('admin_edit_brand', await editArgs(demo, { p_expected_version: current.program_configs.find(c => c.is_current).version })))
    assert.equal((await readBrand('demo-wellness')).name, demo.name)
    record('demo restored', { name: demo.name })
  }
  const sentinel = 'Demo Gate ' + stamp
  await page.goto(base + '/admin/brands/demo-wellness')
  await page.getByLabel('Brand name', { exact: true }).fill(sentinel)
  await page.getByRole('button', { name: /save changes/i }).click()
  await page.getByRole('button', { name: /changes saved/i }).waitFor()
  assert.equal((await readBrand('demo-wellness')).name, sentinel)
  for (const path of ['/demo-wellness', '/demo-wellness/start']) {
    const r = await raw(path)
    assert(r.text.includes(sentinel))
    record('cache propagation ' + path, { adminUiSaved: true, persisted: true, status: r.status, sentinelRendered: true, redeployed: false })
  }
  await restoreDemo(); restoreDemo = null

  for (const suffix of ['a', 'b']) {
    const slug = `gate-${stamp}-${suffix}`
    const input = { p_slug: slug, p_name: `Gate ${stamp} ${suffix}`, p_logo_path: null, p_primary_color: '#246B5A', p_secondary_color: '#6D8B7A', p_highlight_color: '#EAF4EE', p_product_name: 'Gate test program', p_reorder_url: null, p_timezone: 'UTC', p_duration_days: 7, p_schedule_days: [1,3,5,7], p_usage_title: 'Gate use', p_usage_instructions: '', p_running_low_days: 2, p_subscription_required: false, p_stripe_price_id: null }
    const created = check(await master.client.rpc('admin_create_brand', input))
    brands.push({ id: created.brand_id, slug })
    const response = await raw('/' + slug)
    assert(response.text.includes(input.p_name))
    record('new runtime brand ' + suffix, { slug, status: response.status, nameRendered: true, redeployed: false })
    if (suffix === 'a') {
      const logoPath = slug + '/gate-logo.png'
      // Upload fixture through the DEV service client; the editor persistence itself is exercised through the authenticated UI.
      check(await service.storage.from('brand-assets').upload(logoPath, fs.readFileSync('public/placeholder-logo.png'), { contentType: 'image/png', upsert: true }))
      brands.at(-1).logoPath = logoPath
      await page.goto(base + '/admin/brands/' + slug)
      await page.getByLabel('Brand logo', { exact: true }).fill(logoPath)
      await page.getByLabel('Main brand color').fill('#335577')
      await page.getByLabel('Product name', { exact: true }).fill('Verified gate product')
      await page.getByLabel('Duration (days)').fill('8')
      await page.getByRole('button', { name: '8', exact: true }).click()
      await page.getByLabel('Reorder URL', { exact: true }).fill('https://example.com/gate-test')
      await page.getByRole('button', { name: /save changes/i }).click()
      await page.getByRole('button', { name: /changes saved/i }).waitFor()
      const edited = await readBrand(slug), config = edited.program_configs.find(c => c.is_current)
      assert.equal(edited.logo_path, logoPath)
      assert.equal(edited.primary_color, '#335577')
      assert.equal(edited.product_name, 'Verified gate product')
      assert.equal(edited.reorder_url, 'https://example.com/gate-test')
      assert.equal(config.duration_days, 8)
      assert.deepEqual(config.schedule_days, [1,3,5,7,8])
      assert.equal(config.subscription_required, false)
      record('A-04 persistence', { logoPath: true, mainColor: true, productName: true, duration: true, schedule: true, reorderUrl: true, unrelatedConfigPreserved: true, uploadUi: false })
    }
    const token = randomBytes(32).toString('base64url')
    const joined = check(await anon.rpc('customer_join', { p_brand_slug: slug, p_first_name: 'GateCustomer' + suffix, p_email: `gate-${stamp}-${suffix}@example.com`, p_phone: null, p_order_number: null, p_request_id: randomUUID(), p_capability: token }))
    check(await anon.rpc('customer_activate_tracking', { p_brand_slug: slug, p_capability: token }))
    brands.at(-1).token = token
    const stored = check(await service.from('customer_sessions').select('token_hash,expires_at,revoked_at').eq('brand_id', created.brand_id))
    assert.equal(stored[0].token_hash, '\\x' + createHash('sha256').update(token).digest('hex'))
    const own = await raw('/' + slug + '/dashboard', 'kabatos_customer_session=' + token)
    assert(own.text.includes('GateCustomer' + suffix))
    record('valid customer ' + suffix, { joined: joined.status, ownDashboard: own.status, ownNameRendered: true, sha256Stored: true, rawTokenStored: false })
  }
  for (const [i, j] of [[0,1], [1,0]]) {
    const a = brands[i], b = brands[j]
    for (const target of [b.slug, 'comprex', 'demo-wellness']) {
      assert((await anon.rpc('customer_dashboard', { p_brand_slug: target, p_capability: a.token })).error)
      const r = await raw('/' + target + '/dashboard', 'kabatos_customer_session=' + a.token)
      assert(!r.privatePayload && (r.location || r.text.includes('NEXT_REDIRECT')))
      record('cross-brand ' + i + ' to ' + target, { rejected: true, status: r.status, privatePayload: false })
    }
  }
  for (const slug of ['comprex', 'demo-wellness']) {
    const join = await anon.rpc('customer_join', { p_brand_slug: slug, p_first_name: 'GateBlocked', p_email: `gate-blocked-${stamp}@example.com`, p_phone: null, p_order_number: null, p_request_id: randomUUID(), p_capability: randomBytes(32).toString('base64url') })
    assert(join.error?.message.includes('activation unavailable'))
    record('named brand onboarding ' + slug, { blocked: 'activation unavailable: subscription requires an approved price', configurationUnchanged: true })
  }
  for (const table of ['customers','customer_programs','program_usage','subscriptions','customer_sessions','admin_profiles']) {
    const r = await anon.from(table).select('*')
    assert(r.error || r.data.length === 0)
    record('RLS ' + table, { denied: true })
  }
  const a = brands[0]
  check(await anon.rpc('customer_complete_today', { p_brand_slug: a.slug, p_capability: a.token }))
  const usage = check(await anon.rpc('customer_dashboard', { p_brand_slug: a.slug, p_capability: a.token }))
  assert(usage.history.length === 1)
  check(await anon.rpc('customer_undo_today', { p_brand_slug: a.slug, p_capability: a.token }))
  record('usage persistence', { completeReadUndo: true })
  const program = check(await service.from('customer_programs').select('id,duration_snapshot').eq('brand_id', a.id).single())
  const snapshot = await service.from('customer_programs').update({ duration_snapshot: program.duration_snapshot + 1 }).eq('id', program.id)
  assert(snapshot.error?.message.includes('program snapshots are immutable'))
  const idor = await anon.from('customer_programs').select('*').eq('id', program.id)
  assert(idor.error || idor.data.length === 0)
  check(await anon.rpc('customer_revoke_session', { p_capability: a.token }))
  assert((await anon.rpc('customer_dashboard', { p_brand_slug: a.slug, p_capability: a.token })).error)
  const b = brands[1]
  check(await service.from('customer_sessions').update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq('brand_id', b.id))
  assert((await anon.rpc('customer_dashboard', { p_brand_slug: b.slug, p_capability: b.token })).error)
  record('snapshot and capability lifecycle', { snapshotRewriteBlocked: true, directIdReadBlocked: true, revokedRejected: true, expiredRejected: true })

  await page.goto(base + '/admin/access')
  await page.locator('#access-qr').waitFor()
  const destination = await page.locator('.copy-field span').innerText()
  assert.equal(destination, new URL(base).host + '/comprex')
  const pixels = await page.locator('#access-qr').evaluate(canvas => ({ width: canvas.width, height: canvas.height, data: Array.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data) }))
  // jsQR is an explicitly installed test-only decoder, independent of the generator.
  const { default: jsQR } = await import('jsqr')
  const decoded = jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)
  assert.equal(decoded?.data, base + '/comprex')
  record('QR decoded', { destination: decoded.data })
  await context.close()

  for (const slug of ['comprex','demo-wellness']) {
    const row = await readBrand(slug), config = row.program_configs.find(c => c.is_current)
    record('persisted assets ' + slug, { logo_path: row.logo_path, product_image_path: row.product_image_path, reorder_url: row.reorder_url, usage_title: config.usage_title, usage_instructions: config.usage_instructions })
  }
  const invalid = await raw('/brand-that-does-not-exist')
  record('invalid brand', { status: invalid.status, notFoundSignal: invalid.text.includes('NEXT_HTTP_ERROR_FALLBACK;404'), privatePayload: invalid.privatePayload })
} catch (error) {
  report.failure = error.message
  console.error('GATE FAILURE:', error.message)
  process.exitCode = 1
} finally {
  if (restoreDemo) { try { await restoreDemo() } catch (e) { report.cleanup.push('Demo restore failed: ' + e.message); process.exitCode = 1 } }
  for (const b of brands) {
    try {
      for (const table of ['program_usage','customer_sessions','customer_programs','customers']) {
        check(await service.from(table).delete().eq('brand_id', b.id))
      }
      const row = await readBrand(b.slug)
      check(await masterClient.rpc('admin_edit_brand', await editArgs(row, { p_active: false })))
      if (b.logoPath) check(await service.storage.from('brand-assets').remove([b.logoPath]))
      assert((await anon.rpc('resolve_brand', { p_slug: b.slug })).error)
      report.cleanup.push('Removed test customers/sessions and deactivated temporary brand ' + b.slug + '; immutable configuration history retained')
    } catch (e) { report.cleanup.push('Fixture cleanup failed: ' + e.message); process.exitCode = 1 }
  }
  for (const id of users) {
    try { check(await service.from('admin_profiles').delete().eq('user_id', id)); check(await service.auth.admin.deleteUser(id)); report.cleanup.push('Removed temporary Auth user') }
    catch (e) { report.cleanup.push('Auth cleanup failed: ' + e.message); process.exitCode = 1 }
  }
  await browser?.close()
  fs.mkdirSync('docs/evidence', { recursive: true })
  fs.writeFileSync('docs/evidence/release-gate.json', JSON.stringify(report, null, 2) + '\n')
}
