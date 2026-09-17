import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const CUSTOMER_SESSION_COOKIE = 'kabatos_customer_session'
// The DB separately expires unactivated sessions after seven days; verified billing renews its lease.
export const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 90
export function createOpaqueSessionToken() { return randomBytes(32).toString('base64url') }
export function hashSessionToken(token: string) { return createHash('sha256').update(token).digest('hex') }
export async function setCustomerSessionCookie(token: string) {
  const store = await cookies()
  store.set(CUSTOMER_SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: CUSTOMER_SESSION_TTL_SECONDS })
}
export async function revokeCustomerSessionCookie() {
  const store = await cookies()
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value
  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Session revocation unavailable')
    const { error } = await createClient(url, key).rpc('customer_revoke_session', { p_capability: token })
    if (error) throw new Error('Session revocation failed')
  }
  store.set(CUSTOMER_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
}
