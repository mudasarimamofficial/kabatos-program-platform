import { expect, it, vi } from 'vitest'
const set = vi.fn()
vi.mock('next/headers', () => ({ cookies: async () => ({ set, get: () => undefined }) }))
import { CUSTOMER_SESSION_COOKIE, createOpaqueSessionToken, hashSessionToken, setCustomerSessionCookie, revokeCustomerSessionCookie } from './customer-session'

it('creates random capabilities and hashes instead of storing cleartext', () => {
  const token = createOpaqueSessionToken()
  expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
  expect(createOpaqueSessionToken()).not.toBe(token)
  expect(hashSessionToken(token)).toMatch(/^[a-f0-9]{64}$/)
  expect(hashSessionToken(token)).not.toBe(token)
})

it('uses the same tenant-neutral HttpOnly cookie for creation and expiry', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  await setCustomerSessionCookie('capability')
  expect(set).toHaveBeenLastCalledWith(CUSTOMER_SESSION_COOKIE, 'capability', expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' }))
  await revokeCustomerSessionCookie()
  expect(set).toHaveBeenLastCalledWith(CUSTOMER_SESSION_COOKIE, '', expect.objectContaining({ maxAge: 0, httpOnly: true, secure: true }))
  vi.unstubAllEnvs()
})
