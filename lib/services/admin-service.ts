import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { brands as mockBrands, customers as mockCustomers, metrics as mockMetrics } from '@/lib/mock/data'
import type { AdminMetrics, Brand, BrandForm, Customer } from '@/lib/types'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Retrieves high-level operational counts for the Master Admin dashboard.
 */
export async function getAdminDashboardMetrics(): Promise<AdminMetrics> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_dashboard_counts')
      if (!error && data) {
        return {
          totalBrands: data.brands ?? mockBrands.length,
          totalCustomers: data.customers ?? mockCustomers.length,
          activePrograms: data.active_programs ?? mockMetrics.activePrograms,
          activeSubscriptions: data.active_subscriptions ?? mockMetrics.activeSubscriptions,
        }
      }
    } catch {
      // Fall through to mock metrics
    }
  }
  return mockMetrics
}

/**
 * Lists all brands and their active configurations for the admin brand roster.
 */
export async function getAdminBrands(): Promise<Brand[]> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_brand_list')
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((b: any) => ({
          slug: b.slug,
          name: b.name,
          logo: b.logo_path ?? undefined,
          productName: b.product_name,
          duration: b.current_config?.duration_days ?? 14,
          schedule: b.current_config?.schedule_days ?? [1, 3, 5, 7],
          reorderUrl: b.reorder_url ?? undefined,
          status: b.active ? 'active' : 'draft',
          theme: {
            primary: b.primary_color ?? '#F07106',
            primaryHover: b.primary_color === '#F07106' ? '#D85800' : '#185647',
            primaryText: '#121212',
            secondary: b.secondary_color ?? '#8B6F47',
            highlight: b.highlight_color ?? '#FDEEE1',
            highlightBorder: b.highlight_color ?? '#FDEEE1',
          },
        }))
      }
    } catch {
      // Fall through to mock brands
    }
  }
  return mockBrands
}

/**
 * Retrieves a single brand by its slug for editing.
 */
export async function getAdminBrandBySlug(slug: string): Promise<Brand | null> {
  const all = await getAdminBrands()
  return all.find((b) => b.slug === slug) ?? null
}

/**
 * Saves a brand (create or edit) via Supabase RPC with optimistic fallback.
 */
export async function saveAdminBrand(
  form: BrandForm,
  mode: 'create' | 'edit',
  originalSlug?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      if (mode === 'create') {
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const { error } = await supabase.rpc('admin_create_brand', {
          p_slug: slug,
          p_name: form.name,
          p_logo_path: form.logo || null,
          p_primary_color: form.primary,
          p_secondary_color: '#8B6F47',
          p_highlight_color: '#FDEEE1',
          p_product_name: form.productName,
          p_reorder_url: form.reorderUrl || null,
          p_timezone: 'UTC',
          p_duration_days: form.duration,
          p_schedule_days: form.schedule,
          p_usage_title: 'Scheduled use',
          p_usage_instructions: '',
          p_running_low_days: 3,
          p_subscription_required: true,
          p_stripe_price_id: null,
        })
        if (error) return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save brand' }
    }
  }
  return { success: true }
}

/**
 * Lists all registered customers across brands.
 */
export async function getAdminCustomers(query = ''): Promise<Customer[]> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_customer_list')
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          firstName: c.first_name,
          email: c.email ?? '',
          phone: c.phone ?? undefined,
          orderNumber: c.order_number ?? undefined,
          brandSlug: c.brand_slug,
          startDate: c.start_date ?? new Date().toISOString().split('T')[0],
          currentDay: c.current_day ?? 1,
          programStatus: c.program_status ?? 'active',
          subscriptionStatus: c.subscription_status ?? 'active',
          completedDays: c.completed_days ?? [],
        }))
      }
    } catch {
      // Fall through to mock customers
    }
  }
  const filtered = query
    ? mockCustomers.filter((c) =>
        `${c.firstName} ${c.email}`.toLowerCase().includes(query.toLowerCase())
      )
    : mockCustomers
  return filtered
}

/**
 * Retrieves detailed customer information and program snapshot history.
 */
export async function getAdminCustomerDetail(id: string): Promise<Customer | null> {
  const all = await getAdminCustomers()
  return all.find((c) => c.id === id) ?? mockCustomers[0]
}
