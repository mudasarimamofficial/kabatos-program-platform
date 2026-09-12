import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getAuthenticatedAdmin() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  // Check public.admin_profiles for active admin authorization
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.active) return null

  return user
}

export async function requireAdminSession() {
  const user = await getAuthenticatedAdmin()
  if (!user) {
    redirect('/admin/login')
  }
  return user
}

export { signInAdminAction, signOutAdminAction } from './admin-actions'

