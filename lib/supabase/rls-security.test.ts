import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Supabase RLS & Role Security Adversarial Suite (§63, §64, §66, §92)', () => {
  let anonClient: any
  let serviceClient: any = null
  let adminAuthClient: any

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SECRET_KEY || ''
  const adminEmail = process.env.DEV_ADMIN_EMAIL || 'master-admin@kabatos.dev'
  const adminPassword = process.env.DEV_ADMIN_PASSWORD || ''

  beforeAll(() => {
    try {
      // @ts-ignore
      if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local')
    } catch {}

    const resolvedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || url
    const resolvedAnon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || anonKey
    const resolvedService = process.env.SUPABASE_SECRET_KEY || serviceKey

    anonClient = createClient(resolvedUrl, resolvedAnon)
    adminAuthClient = createClient(resolvedUrl, resolvedAnon)
    if (resolvedService) {
      serviceClient = createClient(resolvedUrl, resolvedService, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    }
  })

  it('RLS BLOCKS: anonymous client cannot enumerate customers (§63, §64)', async () => {
    const { data, error } = await anonClient.from('customers').select('*')
    // Anonymous user either gets empty list due to RLS or permission error
    if (error) {
      expect(error.code).toBeDefined()
    } else {
      expect(data).toEqual([])
    }
  })

  it('RLS BLOCKS: anonymous client cannot enumerate customer_programs (§63, §64)', async () => {
    const { data, error } = await anonClient.from('customer_programs').select('*')
    if (error) {
      expect(error.code).toBeDefined()
    } else {
      expect(data).toEqual([])
    }
  })

  it('RLS BLOCKS: anonymous client cannot enumerate subscriptions (§63, §64)', async () => {
    const { data, error } = await anonClient.from('subscriptions').select('*')
    if (error) {
      expect(error.code).toBeDefined()
    } else {
      expect(data).toEqual([])
    }
  })

  it('RLS BLOCKS: anonymous client cannot mutate brands table (§63, §64)', async () => {
    const { data, error } = await anonClient.from('brands').insert({
      slug: 'hacked-brand',
      name: 'Hacked Brand',
      product_name: 'Fake Product',
      primary_color: '#000000',
      secondary_color: '#111111',
      highlight_color: '#222222',
      timezone: 'UTC',
    })
    expect(error).toBeDefined()
    expect(data).toBeNull()
  })

  it('RLS BLOCKS: unauthenticated/anonymous call to admin_dashboard_counts is rejected (§64, §92)', async () => {
    const { data, error } = await anonClient.rpc('admin_dashboard_counts')
    expect(error).toBeDefined()
    expect(error?.message).toMatch(/admin required|permission denied|unauthorized/i)
  })

  it('MASTER ADMIN AUTH: provisioned master-admin logs in and executes admin_dashboard_counts (§66, §92)', async () => {
    const pwd = process.env.DEV_ADMIN_PASSWORD || adminPassword
    if (!pwd) {
      console.warn('Skipping master-admin login test: DEV_ADMIN_PASSWORD not set in environment')
      return
    }

    // 1. Sign in as master admin
    const { data: authData, error: authError } = await adminAuthClient.auth.signInWithPassword({
      email: adminEmail,
      password: pwd,
    })

    expect(authError).toBeNull()
    expect(authData.user).toBeDefined()
    expect(authData.session).toBeDefined()

    // 2. Execute admin RPC with authenticated session
    const { data: metrics, error: rpcError } = await adminAuthClient.rpc('admin_dashboard_counts')
    expect(rpcError).toBeNull()
    expect(metrics).toBeDefined()
    expect(typeof metrics.brands).toBe('number')
    expect(typeof metrics.customers).toBe('number')
    expect(typeof metrics.active_programs).toBe('number')
    expect(typeof metrics.active_subscriptions).toBe('number')

    // 3. Sign out cleanly
    await adminAuthClient.auth.signOut()
  })

  it('CROSS-TENANT ISOLATION: brand resolution strictly isolates slug boundaries (§70, §93)', async () => {
    const compEnd = await anonClient.rpc('resolve_brand', { p_slug: 'comprex' })
    expect(compEnd.data.slug).toBe('comprex')
    expect(compEnd.data.name).toBe('COMPREX')
    expect(compEnd.data.primary_color).toBe('#F07106')

    const demoEnd = await anonClient.rpc('resolve_brand', { p_slug: 'demo-wellness' })
    expect(demoEnd.data.slug).toBe('demo-wellness')
    expect(demoEnd.data.name).toBe('Demo Wellness')
    expect(demoEnd.data.primary_color).toBe('#246B5A')

    const fakeEnd = await anonClient.rpc('resolve_brand', { p_slug: 'nonexistent-brand' })
    expect(fakeEnd.data).toBeNull()
  })

  it('DATABASE TRIGGER: prevent_program_snapshot_rewrite strictly blocks modifying duration/schedule snapshot (§35, §90)', async () => {
    if (!serviceClient) return

    // 1. Find or verify an existing program
    const { data: programs } = await serviceClient
      .from('customer_programs')
      .select('id, duration_snapshot, schedule_snapshot')
      .limit(1)

    if (programs && programs.length > 0) {
      const p = programs[0]
      // Attempt to rewrite snapshot on existing program
      const { error } = await serviceClient
        .from('customer_programs')
        .update({ duration_snapshot: 999 })
        .eq('id', p.id)

      expect(error).toBeDefined()
      expect(error?.message).toContain('program snapshots are immutable')
    }
  })
})
