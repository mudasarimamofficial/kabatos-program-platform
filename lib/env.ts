import { z } from 'zod'

const optionalUrl = z.string().url().optional()

export const publicEnv = {
  supabaseUrl: optionalUrl.parse(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: z.string().optional().parse(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  stripePublishableKey: z.string().optional().parse(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY),
}

export function requireServerEnv(name: 'STRIPE_SECRET_KEY' | 'STRIPE_WEBHOOK_SECRET' | 'SUPABASE_URL' | 'SUPABASE_SECRET_KEY') {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required for this server operation`)
  return value
}

export const envExample = `NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\nSUPABASE_URL=\nSUPABASE_SECRET_KEY=\nSTRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\n`

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey)
}
