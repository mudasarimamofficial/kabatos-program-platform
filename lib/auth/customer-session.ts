import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'

export const CUSTOMER_SESSION_COOKIE = 'kabatos_customer_session'
export const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
export function createOpaqueSessionToken() { return randomBytes(32).toString('base64url') }
export function hashSessionToken(token: string) { return createHash('sha256').update(token).digest('hex') }
export async function setCustomerSessionCookie(token: string) {
  const store = await cookies()
  store.set(CUSTOMER_SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: CUSTOMER_SESSION_TTL_SECONDS })
}
export async function revokeCustomerSessionCookie() { (await cookies()).set(CUSTOMER_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 }) }
