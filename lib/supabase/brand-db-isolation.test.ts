import { describe, expect, it } from 'vitest'
import { resolveBrand } from '@/lib/services/customer-service'

describe('Brand Resolution Real Database Isolation (§70, §93, Item 8)', () => {
  it('resolves COMPREX purely from real Supabase DEV database with DB values', async () => {
    try {
      // @ts-ignore
      if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local')
    } catch {}

    const brand = await resolveBrand('comprex')
    expect(brand).not.toBeNull()
    if (!brand) return

    expect(brand.slug).toBe('comprex')
    expect(brand.name).toBe('COMPREX')
    expect(brand.productName).toBe('COMPREX')
    expect(brand.duration).toBe(14)
    expect(brand.schedule).toEqual([1, 3, 5, 7, 9, 11, 13])
    expect(brand.theme.primary).toBe('#F07106')
    expect(brand.theme.secondary).toBe('#8B6F47')
    expect(brand.theme.highlight).toBe('#FDEEE1')
  })

  it('resolves Demo Wellness purely from real Supabase DEV database (NOT mock data)', async () => {
    try {
      // @ts-ignore
      if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local')
    } catch {}

    const brand = await resolveBrand('demo-wellness')
    expect(brand).not.toBeNull()
    if (!brand) return

    expect(brand.slug).toBe('demo-wellness')
    expect(brand.name).toBe('Demo Wellness')
    // In real DB: productName is 'Wellness 10', schedule is [2, 4, 6, 8, 10], primary is #246B5A
    // In mock data: productName is 'Daily Balance', schedule is [1, 3, 5, 7, 9], primary is #2F7D72
    // This proves DB is resolved and mock data is NOT used!
    expect(brand.productName).toBe('Wellness 10')
    expect(brand.duration).toBe(10)
    expect(brand.schedule).toEqual([2, 4, 6, 8, 10])
    expect(brand.theme.primary).toBe('#246B5A')
    expect(brand.theme.secondary).toBe('#6D8B7A')
    expect(brand.theme.highlight).toBe('#EAF4EE')
  })

  it('fails cleanly on unknown brand without mock fallback', async () => {
    try {
      // @ts-ignore
      if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local')
    } catch {}

    const brand = await resolveBrand('brand-that-does-not-exist')
    expect(brand).toBeNull()
  })
})
