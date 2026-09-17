import 'server-only'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { requireServerEnv } from '@/lib/env'
import { CUSTOMER_SESSION_COOKIE } from '@/lib/auth/customer-session'
import { COMPREX_PLAN } from './plan'

let client: Stripe | undefined
export function getStripe() {
  const key = requireServerEnv('STRIPE_SECRET_KEY')
  if (!/^(sk|rk)_test_/.test(key)) throw new Error('Stripe TEST configuration required')
  return (client ??= new Stripe(key))
}
export function billingDb(service = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (!['finbvtwjddrmbuuuyeni.supabase.co', 'localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
    throw new Error('Billing TEST requires DEV or local database')
  }
  return createClient(url, service ? requireServerEnv('SUPABASE_SECRET_KEY') : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
export async function rpc(db: ReturnType<typeof billingDb>, name: string, args: Record<string, unknown>) {
  const { data, error } = await db.rpc(name, args)
  if (error) throw new Error(`Billing database operation failed: ${name}`)
  return data
}
export async function customerCapability() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Customer session required')
  return token
}
export function approvedPriceId() {
  const value = process.env.COMPREX_STRIPE_TEST_PRICE_ID
  if (!value || !/^price_[A-Za-z0-9]+$/.test(value)) throw new Error('Stripe TEST price not configured')
  return value
}
export function assertApprovedPrice(price: Stripe.Price) {
  if (price.livemode || !price.active || price.id !== approvedPriceId() || price.unit_amount !== COMPREX_PLAN.amount ||
      price.currency !== COMPREX_PLAN.currency || price.recurring?.interval !== COMPREX_PLAN.interval ||
      price.recurring.interval_count !== 1 || price.billing_scheme !== 'per_unit' || price.recurring.usage_type !== 'licensed') {
    throw new Error('Stripe price does not match approved TEST terms')
  }
}
