import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect('/admin/login')
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/admin/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('active')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile || !profile.active) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
