import { createBrowserClient } from '@supabase/ssr'
import { publicEnv } from '@/lib/env'

export function createSupabaseBrowserClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabasePublishableKey) return null
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey)
}
