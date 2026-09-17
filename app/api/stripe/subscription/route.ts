import { NextResponse } from 'next/server'
import { getSubscriptionState, cancelCustomerSubscription } from '@/lib/stripe/customer'
import { customerCapability } from '@/lib/stripe/server'
import { checkoutInputSchema } from '@/lib/stripe/validation'

const headers = { 'Cache-Control': 'private, no-store' }
export async function GET(request: Request) {
  const parsed = checkoutInputSchema.safeParse({ brandSlug: new URL(request.url).searchParams.get('brandSlug') })
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  const state = await getSubscriptionState(parsed.data.brandSlug)
  return state ? NextResponse.json(state, { headers }) : NextResponse.json({ error: 'Customer session required' }, { status: 401, headers })
}
export async function POST(request: Request) {
  // JSON + SameSite=Lax prevents cross-site form submission; no credentialed CORS is enabled.
  if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'JSON required' }, { status: 415, headers })
  const parsed = checkoutInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  let capability: string
  try { capability = await customerCapability() } catch { return NextResponse.json({ error: 'Customer session required' }, { status: 401, headers }) }
  try {
    await cancelCustomerSubscription(parsed.data.brandSlug, capability)
    return NextResponse.json(await getSubscriptionState(parsed.data.brandSlug), { headers })
  } catch { return NextResponse.json({ error: 'Cancellation could not be confirmed. Please retry.' }, { status: 409, headers }) }
}
