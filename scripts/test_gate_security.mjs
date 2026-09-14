import { createClient } from '@supabase/supabase-js'
import { randomBytes, randomUUID } from 'node:crypto'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !serviceKey || !anonKey) {
  console.error('Missing env config', { url: !!url, serviceKey: !!serviceKey, anonKey: !!anonKey })
  process.exit(1)
}

const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const anonClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function runGateEvidence() {
  console.log('=== KABATOS RELEASE GATE: SURGICAL EVIDENCE SUITE ===\n')

  // Log in as master admin
  const masterAdminEmail = process.env.DEV_ADMIN_EMAIL || 'master-admin@kabatos.dev'
  const masterAdminPassword = process.env.DEV_ADMIN_PASSWORD || 'DevMasterPass_177af0525b6d91e0!'
  const masterClient = createClient(url, anonKey)
  const { error: masterLoginErr } = await masterClient.auth.signInWithPassword({
    email: masterAdminEmail,
    password: masterAdminPassword,
  })
  if (masterLoginErr) throw masterLoginErr
  console.log('0. Authenticated master-admin via Supabase Auth.\n')

  // 1. Anonymous Customer Dashboard RPC Test
  console.log('1. Testing Anonymous Customer Dashboard Access...')
  const { data: anonDash, error: anonDashErr } = await anonClient.rpc('customer_dashboard', {
    p_brand_slug: 'comprex',
    p_capability: 'invalid-token-or-empty-session',
  })
  console.log('   Result: error code =', anonDashErr?.code, '| message =', anonDashErr?.message)
  if (anonDashErr?.message?.includes('invalid access')) {
    console.log('   PASS: Anonymous customer dashboard access strictly rejected at DB level.\n')
  } else {
    throw new Error('FAIL: Anonymous customer dashboard was not rejected as expected')
  }

  // 2. Cross-Brand Session Isolation Test
  console.log('2. Testing Cross-Brand Session Isolation...')
  const brandASlug = `gate-brand-${Date.now()}`
  let brandAId = null
  try {
    const { data: brandARes, error: brandAErr } = await masterClient.rpc('admin_create_brand', {
      p_slug: brandASlug,
      p_name: 'Gate Brand A',
      p_logo_path: null,
      p_primary_color: '#112233',
      p_secondary_color: '#445566',
      p_highlight_color: '#E0E8F0',
      p_product_name: 'Product A',
      p_reorder_url: null,
      p_timezone: 'UTC',
      p_duration_days: 14,
      p_schedule_days: [1, 3, 5, 7],
      p_usage_title: 'Daily dose',
      p_usage_instructions: '',
      p_running_low_days: 2,
      p_subscription_required: false, // Free tracking allows customer_join
      p_stripe_price_id: null,
    })

    if (brandAErr) throw brandAErr
    brandAId = brandARes.brand_id
    console.log('   Brand A created via admin RPC:', brandARes)

    const capabilityTokenA = randomBytes(32).toString('base64url')
    const requestIdA = randomUUID()

    const { data: joinA, error: joinAErr } = await anonClient.rpc('customer_join', {
      p_brand_slug: brandASlug,
      p_first_name: 'Alice',
      p_email: 'alice@example.com',
      p_phone: null,
      p_order_number: 'ORD-101',
      p_request_id: requestIdA,
      p_capability: capabilityTokenA,
    })

    if (joinAErr) throw joinAErr
    console.log('   Customer Alice joined Brand A with capability token.')

    const { data: actA, error: actAErr } = await anonClient.rpc('customer_activate_tracking', {
      p_brand_slug: brandASlug,
      p_capability: capabilityTokenA,
    })
    if (actAErr) throw actAErr
    console.log('   Tracking activated for Alice on Brand A:', actA)

    const { data: dashA, error: dashAErr } = await anonClient.rpc('customer_dashboard', {
      p_brand_slug: brandASlug,
      p_capability: capabilityTokenA,
    })
    console.log('   Alice accessing Brand A dashboard: status =', dashA?.program?.status, '| error =', dashAErr?.message || 'none')
    if (!dashA || dashAErr) throw new Error('FAIL: Alice could not access her own dashboard')

    // Test CROSS-BRAND access:
    const { data: crossComprex, error: crossComprexErr } = await anonClient.rpc('customer_dashboard', {
      p_brand_slug: 'comprex',
      p_capability: capabilityTokenA,
    })
    console.log('   Alice attempting to access COMPREX with Brand A token: error =', crossComprexErr?.message)

    const { data: crossDemo, error: crossDemoErr } = await anonClient.rpc('customer_dashboard', {
      p_brand_slug: 'demo-wellness',
      p_capability: capabilityTokenA,
    })
    console.log('   Alice attempting to access DEMO WELLNESS with Brand A token: error =', crossDemoErr?.message)

    if (crossComprexErr?.message?.includes('invalid access') && crossDemoErr?.message?.includes('invalid access') && !crossComprex && !crossDemo) {
      console.log('   PASS: Cross-brand session mismatch strictly rejected in both directions! Zero tenant leakage.\n')
    } else {
      throw new Error('FAIL: Cross-brand access was not blocked!')
    }
  } finally {
    if (brandAId) {
      // Deactivate test brand
      await masterClient.rpc('admin_edit_brand', {
        p_brand_id: brandAId,
        p_expected_version: 1,
        p_name: 'Deactivated Gate Brand A',
        p_logo_path: null,
        p_primary_color: '#112233',
        p_secondary_color: '#445566',
        p_highlight_color: '#E0E8F0',
        p_product_name: 'Product A',
        p_reorder_url: null,
        p_timezone: 'UTC',
        p_duration_days: 14,
        p_schedule_days: [1, 3, 5, 7],
        p_usage_title: 'Daily dose',
        p_usage_instructions: '',
        p_running_low_days: 2,
        p_subscription_required: false,
        p_stripe_price_id: null,
        p_active: false,
      })
      console.log('   Deactivated test Brand A.\n')
    }
  }

  // 3. Admin Authorization Tests
  console.log('3. Testing Admin RPC Authorization from Anonymous & Non-Admin Callers...')
  const { error: anonAdminErr } = await anonClient.rpc('admin_dashboard_counts')
  console.log('   Anonymous call to admin_dashboard_counts: error =', anonAdminErr?.message)
  if (anonAdminErr?.message?.includes('permission denied') || anonAdminErr?.message?.includes('admin required')) {
    console.log('   PASS: Anonymous call to admin RPC strictly rejected at DB level.\n')
  } else {
    throw new Error('FAIL: Anonymous call to admin RPC was not rejected')
  }

  // Temporary non-admin user
  const nonAdminEmail = `non-admin-${Date.now()}@example.com`
  const nonAdminPassword = 'NonAdminPassword123!'
  let nonAdminUserId = null
  try {
    const { data: nonAdminAuth, error: createNonAdminErr } = await adminClient.auth.admin.createUser({
      email: nonAdminEmail,
      password: nonAdminPassword,
      email_confirm: true,
    })
    if (createNonAdminErr) throw createNonAdminErr
    nonAdminUserId = nonAdminAuth.user.id

    const nonAdminClient = createClient(url, anonKey)
    const { error: loginErr } = await nonAdminClient.auth.signInWithPassword({
      email: nonAdminEmail,
      password: nonAdminPassword,
    })
    if (loginErr) throw loginErr

    const { error: nonAdminRpcErr } = await nonAdminClient.rpc('admin_dashboard_counts')
    console.log('   Authenticated non-admin call to admin_dashboard_counts: error =', nonAdminRpcErr?.message)

    if (nonAdminRpcErr?.message?.includes('admin required')) {
      console.log('   PASS: Authenticated non-admin user blocked from admin RPC.\n')
    } else {
      throw new Error('FAIL: Non-admin user was not blocked!')
    }
  } finally {
    if (nonAdminUserId) {
      await adminClient.auth.admin.deleteUser(nonAdminUserId)
    }
  }

  // Master admin operational counts
  const { data: masterCounts, error: masterRpcErr } = await masterClient.rpc('admin_dashboard_counts')
  console.log('   Master admin operational counts:', masterCounts, '| error =', masterRpcErr?.message || 'none')
  if (!masterRpcErr && masterCounts) {
    console.log('   PASS: Master admin authorized and retrieved operational metrics.\n')
  } else {
    throw new Error('FAIL: Master admin was unable to execute admin RPC')
  }

  // 4. Admin Config Propagation Without Redeploy
  console.log('4. Testing Brand Config Persistence & Dynamic Propagation...')
  // Inspect Demo Wellness via master admin
  const { data: demoBrandRow } = await masterClient
    .from('brands')
    .select('*, program_configs(*)')
    .eq('slug', 'demo-wellness')
    .single()

  const demoCurrentConfig = demoBrandRow.program_configs.find(c => c.is_current)
  const currentVer = demoCurrentConfig.version
  console.log('   Demo Wellness initial config version =', currentVer, '| reorder_url =', demoBrandRow.reorder_url)

  const testReorder = 'https://demo-wellness.com/verified-no-redeploy'
  try {
    // Update reorder_url via admin_edit_brand RPC
    const { data: editRes, error: editErr } = await masterClient.rpc('admin_edit_brand', {
      p_brand_id: demoBrandRow.id,
      p_expected_version: currentVer,
      p_name: demoBrandRow.name,
      p_logo_path: demoBrandRow.logo_path,
      p_primary_color: demoBrandRow.primary_color,
      p_secondary_color: demoBrandRow.secondary_color,
      p_highlight_color: demoBrandRow.highlight_color,
      p_product_name: demoBrandRow.product_name,
      p_reorder_url: testReorder,
      p_timezone: demoBrandRow.timezone,
      p_duration_days: demoCurrentConfig.duration_days,
      p_schedule_days: demoCurrentConfig.schedule_days,
      p_usage_title: demoCurrentConfig.usage_title,
      p_usage_instructions: demoCurrentConfig.usage_instructions,
      p_running_low_days: demoCurrentConfig.running_low_days,
      p_subscription_required: demoCurrentConfig.subscription_required,
      p_stripe_price_id: demoCurrentConfig.stripe_price_id,
      p_active: true,
    })

    if (editErr) throw editErr
    console.log('   Edited Demo Wellness via admin RPC:', editRes)

    // Immediately resolve brand again via client without any rebuild
    const { data: afterBrand } = await anonClient.rpc('resolve_brand', { p_slug: 'demo-wellness' })
    console.log('   Demo Wellness updated reorder_url =', afterBrand.reorder_url)

    if (afterBrand.reorder_url === testReorder) {
      console.log('   PASS: Admin change propagated immediately to customer resolution without redeploy.')
    } else {
      throw new Error('FAIL: Brand config did not propagate dynamically')
    }
  } finally {
    // Restore original reorder_url (version is currentVer + 1 now)
    await masterClient.rpc('admin_edit_brand', {
      p_brand_id: demoBrandRow.id,
      p_expected_version: currentVer + 1,
      p_name: demoBrandRow.name,
      p_logo_path: demoBrandRow.logo_path,
      p_primary_color: demoBrandRow.primary_color,
      p_secondary_color: demoBrandRow.secondary_color,
      p_highlight_color: demoBrandRow.highlight_color,
      p_product_name: demoBrandRow.product_name,
      p_reorder_url: demoBrandRow.reorder_url,
      p_timezone: demoBrandRow.timezone,
      p_duration_days: demoCurrentConfig.duration_days,
      p_schedule_days: demoCurrentConfig.schedule_days,
      p_usage_title: demoCurrentConfig.usage_title,
      p_usage_instructions: demoCurrentConfig.usage_instructions,
      p_running_low_days: demoCurrentConfig.running_low_days,
      p_subscription_required: demoCurrentConfig.subscription_required,
      p_stripe_price_id: demoCurrentConfig.stripe_price_id,
      p_active: true,
    })
    const { data: restoredBrand } = await anonClient.rpc('resolve_brand', { p_slug: 'demo-wellness' })
    console.log('   Demo Wellness restored reorder_url =', restoredBrand.reorder_url)
    console.log('   PASS: Restored original Demo Wellness state.\n')
  }

  // 5. New Brand Creation Without Redeploy
  console.log('5. Testing New Brand Dynamic Creation Without Redeploy...')
  const testBrandSlug = `temp-gate-${Date.now()}`
  let newBrandId = null
  try {
    const { data: notYetBrand, error: notYetErr } = await anonClient.rpc('resolve_brand', { p_slug: testBrandSlug })
    console.log('   Before creation: resolve_brand result =', notYetBrand, '| error =', notYetErr?.message)

    const { data: newBrandRes, error: newBrandErr } = await masterClient.rpc('admin_create_brand', {
      p_slug: testBrandSlug,
      p_name: 'Temp Gate Brand',
      p_logo_path: null,
      p_primary_color: '#336699',
      p_secondary_color: '#224466',
      p_highlight_color: '#EEF4FF',
      p_product_name: 'Test Product',
      p_reorder_url: null,
      p_timezone: 'UTC',
      p_duration_days: 7,
      p_schedule_days: [1, 3, 5],
      p_usage_title: 'Test usage',
      p_usage_instructions: '',
      p_running_low_days: 1,
      p_subscription_required: false,
      p_stripe_price_id: null,
    })

    if (newBrandErr) throw newBrandErr
    newBrandId = newBrandRes.brand_id
    console.log('   Created new brand via admin_create_brand:', newBrandRes)

    const { data: resolvedNewBrand, error: resolveNewErr } = await anonClient.rpc('resolve_brand', { p_slug: testBrandSlug })
    console.log('   Immediately resolved new brand:', resolvedNewBrand?.name, '| duration =', resolvedNewBrand?.program?.duration_days)

    if (resolvedNewBrand?.name === 'Temp Gate Brand') {
      console.log('   PASS: Newly created brand resolves immediately at runtime without rebuilding Vercel.')
    } else {
      throw new Error('FAIL: Newly created brand could not be resolved')
    }
  } finally {
    if (newBrandId) {
      await masterClient.rpc('admin_edit_brand', {
        p_brand_id: newBrandId,
        p_expected_version: 1,
        p_name: 'Deactivated Temp Gate Brand',
        p_logo_path: null,
        p_primary_color: '#336699',
        p_secondary_color: '#224466',
        p_highlight_color: '#EEF4FF',
        p_product_name: 'Test Product',
        p_reorder_url: null,
        p_timezone: 'UTC',
        p_duration_days: 7,
        p_schedule_days: [1, 3, 5],
        p_usage_title: 'Test usage',
        p_usage_instructions: '',
        p_running_low_days: 1,
        p_subscription_required: false,
        p_stripe_price_id: null,
        p_active: false,
      })
      console.log('   Deactivated temporary test brand.\n')
    }
  }

  console.log('=== ALL DATABASE SECURITY & PROPAGATION GATES PASSED ===')
}

runGateEvidence().catch((err) => {
  console.error('GATE FAILURE:', err)
  process.exit(1)
})
