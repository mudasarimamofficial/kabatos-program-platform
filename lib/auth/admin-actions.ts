'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function signInAdminAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    // If Supabase not configured locally, allow dev preview transition
    return { success: true }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Verify that the user is in admin_profiles
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active')
    .eq('user_id', data.user.id)
    .single()

  if (!profile || !profile.active) {
    await supabase.auth.signOut()
    return { success: false, error: 'Unauthorized: Master admin account required.' }
  }

  return { success: true }
}

export async function signOutAdminAction() {
  const supabase = await createSupabaseServerClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}
