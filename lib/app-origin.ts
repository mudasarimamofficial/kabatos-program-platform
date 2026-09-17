import 'server-only'

/** Only deployment-owned configuration may choose payment return destinations. */
export function getTrustedAppOrigin(env: Record<string, string | undefined> = process.env): string {
  const value = env.VERCEL_ENV === 'preview' && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}`
    : env.NEXT_PUBLIC_APP_URL
  if (!value) throw new Error('Trusted app origin is not configured')
  const url = new URL(value)
  const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Trusted app origin must be an HTTPS origin')
  }
  return url.origin
}
