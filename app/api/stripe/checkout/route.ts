import { NextResponse } from 'next/server'
import { resolveBrand } from '@/lib/services/customer-service'
import { getStripe } from '@/lib/stripe/server'
import { checkoutInputSchema } from '@/lib/stripe/validation'
import { getTrustedAppOrigin } from '@/lib/app-origin'

export async function POST(request: Request) {
  const parsed = checkoutInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
  const brand = await resolveBrand(parsed.data.brandSlug)
  if (!brand) return NextResponse.json({ error: 'Brand unavailable' }, { status: 404 })
  const priceId = process.env.COMPREX_STRIPE_TEST_PRICE_ID
  if (!priceId) return NextResponse.json({ error: 'BLOCKED_PENDING_APPROVED_STRIPE_PRICE' }, { status: 503 })
  const origin = getTrustedAppOrigin()
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/${brand.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${brand.slug}/checkout?checkout=cancelled`,
    metadata: { brandSlug: brand.slug, customerId: parsed.data.customerId ?? '' },
    subscription_data: { metadata: { brandSlug: brand.slug, customerId: parsed.data.customerId ?? '' } },
  })
  return NextResponse.json({ url: session.url })
}
