import { describe, expect, it } from 'vitest'
import { getTrustedAppOrigin } from './app-origin'

describe('Trusted checkout origin', () => {
  it('uses the deployment-owned preview host ahead of stale public configuration', () => {
    expect(getTrustedAppOrigin({ VERCEL_ENV: 'preview', VERCEL_URL: 'current.vercel.app', NEXT_PUBLIC_APP_URL: 'https://old.vercel.app' })).toBe('https://current.vercel.app')
  })
  it('requires deliberate production configuration', () => {
    expect(() => getTrustedAppOrigin({ NODE_ENV: 'production' })).toThrow()
    expect(getTrustedAppOrigin({ NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: 'https://example.com' })).toBe('https://example.com')
  })
  it.each(['https://user:password@example.com', 'https://example.com/path', 'http://example.com', 'https://example.com?redirect=evil'])('rejects malformed origin %s', (value) => {
    expect(() => getTrustedAppOrigin({ NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: value })).toThrow()
  })
})
