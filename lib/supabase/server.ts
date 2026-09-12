import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null
  const cookieStore = await cookies()
  return createServerClient(publicEnv.supabaseUrl!, publicEnv.supabasePublishableKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  })
}
