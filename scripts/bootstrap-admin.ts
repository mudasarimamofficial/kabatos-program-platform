/**
 * Kabatos Program Platform / COMPREX
 * Master Admin Provisioning Script (DEV ONLY)
 *
 * Provisions a master administrator in Supabase Auth and inserts their user UUID
 * into public.admin_profiles with active=true.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure_pass pnpm tsx scripts/bootstrap-admin.ts
 */

import { createClient } from '@supabase/supabase-js'

async function bootstrapMasterAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SECRET_KEY are required to provision an admin.')
    process.exit(1)
  }

  const email = process.env.ADMIN_EMAIL || 'admin@kabatos.dev'
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('Error: ADMIN_PASSWORD environment variable is required.')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`Checking existing user for ${email}...`)
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Failed to list users:', listError.message)
    process.exit(1)
  }

  let user = users.users.find((u) => u.email === email)
  if (!user) {
    console.log(`Creating new Supabase Auth user: ${email}...`)
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError) {
      console.error('Failed to create auth user:', createError.message)
      process.exit(1)
    }
    user = created.user
    console.log(`User created with ID: ${user.id}`)
  } else {
    console.log(`User ${email} already exists with ID: ${user.id}`)
  }

  console.log('Activating user in public.admin_profiles...')
  const { error: profileError } = await supabase
    .from('admin_profiles')
    .upsert({ user_id: user.id, active: true }, { onConflict: 'user_id' })

  if (profileError) {
    console.error('Failed to update admin_profiles:', profileError.message)
    process.exit(1)
  }

  console.log(`Success: Master administrator ${email} is active in DEV database.`)
}

bootstrapMasterAdmin().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
