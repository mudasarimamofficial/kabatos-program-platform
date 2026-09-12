import { describe, expect, it } from 'vitest'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'
import { createClient } from '@supabase/supabase-js'

describe('Supabase Client & RPC Contract', () => {
  it('reads public environment variables correctly', () => {
    expect(typeof publicEnv).toBe('object')
  })

  it('connects to Supabase DEV if configured and resolves COMPREX brand', async () => {
    try {
      // @ts-ignore
      if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local')
    } catch {}

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!url || !key) {
      console.warn('Skipping remote RPC test: Supabase environment variables not loaded in test runner')
      return
    }

    const client = createClient(url, key)
    const { data, error } = await client.rpc('resolve_brand', { p_slug: 'comprex' })

    expect(error).toBeNull()
    expect(data).toBeDefined()
    console.log('REAL DEV DATABASE COMPREX BRAND DATA:', JSON.stringify(data, null, 2))
    expect(data.slug).toBe('comprex')
    expect(data.name).toBe('COMPREX')
    expect(data.primary_color).toBe('#F07106')
    expect(data.program).toBeDefined()
    expect(data.program.duration_days).toBe(14)
    expect(data.program.schedule_days).toEqual([1, 3, 5, 7, 9, 11, 13])

    const demo = await client.rpc('resolve_brand', { p_slug: 'demo-wellness' })
    expect(demo.error).toBeNull()
    expect(demo.data.slug).toBe('demo-wellness')
    expect(demo.data.name).toBe('Demo Wellness')
    expect(demo.data.primary_color).toBe('#246B5A')
    expect(demo.data.program.duration_days).toBe(10)
    expect(demo.data.program.schedule_days).toEqual([2, 4, 6, 8, 10])
  }, 25000)
})
