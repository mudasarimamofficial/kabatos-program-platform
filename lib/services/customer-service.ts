import { deriveHoverColor, deriveTextColor } from '@/lib/program/contrast'
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
  createOpaqueSessionToken,
  CUSTOMER_SESSION_COOKIE,
  setCustomerSessionCookie,
} from '@/lib/auth/customer-session'
import type { Brand, Customer, ProgramSummary, ScheduleItem } from '@/lib/types'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}


export function formatBrandFromDb(data: any): Brand {
  const primary = data.primary_color ?? '#121212'
  const secondary = data.secondary_color ?? '#666666'
  const highlight = data.highlight_color ?? '#F4F4F4'
  return {
    slug: data.slug,
    name: data.name,
    logo: data.logo_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL}/storage/v1/object/public/brand-assets/${data.logo_path}` : undefined,
    productImage: data.product_image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL}/storage/v1/object/public/brand-assets/${data.product_image_path}` : undefined,
    productName: data.product_name,
    duration: data.program?.duration_days ?? 14,
    schedule: data.program?.schedule_days ?? [1, 3, 5, 7, 9, 11, 13],
    usageTitle: data.program?.usage_title ?? undefined,
    usageInstructions: data.program?.usage_instructions ?? undefined,
    reorderUrl: data.reorder_url ?? undefined,
    status: 'active',
    theme: {
      primary,
      primaryHover: deriveHoverColor(primary),
      primaryText: deriveTextColor(primary),
      secondary,
      highlight,
      highlightBorder: highlight,
    },
  }
}

/**
 * Resolves brand configuration from Supabase DEV database.
 * Never masks missing or unknown brands with mock data when Supabase is configured.
 */
export async function resolveBrand(slug: string): Promise<Brand | null> {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('resolve_brand', { p_slug: slug })
      if (!error && data) {
        return formatBrandFromDb(data)
      }
      if (error) {
        // Brand unavailable or inactive in database
        return null
      }
    } catch {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) {
        return null
      }
    }
  }
  // Only fall back to mock data if Supabase is unconfigured (offline development)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) {
    return null
  }
  return null
}

export interface JoinProgramInput {
  brandSlug: string
  firstName: string
  email?: string
  phone?: string
  orderNumber?: string
}

/**
 * Onboards a customer into a real program snapshot and establishes a secure session.
 */
export async function joinProgram(input: JoinProgramInput): Promise<{
  success: boolean
  error?: string
  status?: string
}> {
  const supabase = getSupabaseClient()
  const token = createOpaqueSessionToken()
  const requestId = crypto.randomUUID()

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('customer_join', {
        p_brand_slug: input.brandSlug,
        p_first_name: input.firstName.trim(),
        p_email: input.email ? input.email.trim() : null,
        p_phone: input.phone ? input.phone.trim() : null,
        p_order_number: input.orderNumber ? input.orderNumber.trim() : null,
        p_request_id: requestId,
        p_capability: token,
      })

      if (error) {
        // If paid activation is blocked pending stripe price, provide friendly status
        if (error.message.includes('activation unavailable')) {
          return { success: false, error: 'Program activation is currently unavailable.' }
        }
        return { success: false, error: error.message }
      }

      await setCustomerSessionCookie(token)
      return { success: true, status: data?.status ?? 'not_started' }
    } catch (err: any) {
      // Fall through to session fallback
    }
  }

  return { success: false, error: 'Program service unavailable. Please try again.' }
}

export interface DashboardData {
  brand: Brand
  customer: Customer
  summary: ProgramSummary
  items: ScheduleItem[]
  isLiveSession: boolean
}

/**
 * Retrieves authenticated customer program state from Supabase DEV via capability cookie.
 */
export async function getCustomerDashboard(brandSlug: string): Promise<DashboardData | null> {
  const brand = await resolveBrand(brandSlug)
  if (!brand) return null

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const supabase = getSupabaseClient()

  if (supabase) {
    if (!sessionToken) return null
    try {
      const { data, error } = await supabase.rpc('customer_dashboard', {
        p_brand_slug: brandSlug,
        p_capability: sessionToken,
      })

      if (error || !data) {
        return null
      }

      const p = data.program
      // Existing programs retain their enrolled configuration after an admin edit.
      brand.duration = p.duration_days
      brand.schedule = p.schedule_days
      brand.usageTitle = p.usage_title
      brand.usageInstructions = p.usage_instructions
      const completedDay = data.usage?.scheduled_day
      const completedAt = data.usage?.completed_at
      const completedDays: number[] = data.history?.filter((u: any) => u.completed_at).map((u: any) => u.scheduled_day) ?? (completedAt && completedDay ? [completedDay] : [])

      const customer: Customer = {
        id: data.customer?.id ?? '',
        firstName: data.customer?.first_name ?? '',
        email: '',
        brandSlug,
        startDate: p.start_date ?? new Date().toISOString().split('T')[0],
        currentDay: p.current_day ?? 1,
        programStatus: p.status ?? 'active',
        subscriptionStatus: data.subscription?.status ?? 'active',
        completedDays,
      }

      const summary: ProgramSummary = {
        currentDay: p.current_day ?? 1,
        progressPercent: p.progress_percent ?? 0,
        remainingDays: p.estimated_days_remaining ?? brand.duration,
        nextScheduledDay: p.next_scheduled_day ?? undefined,
        scheduledToday: Boolean(p.current_day && brand.schedule.includes(p.current_day) && !completedAt),
        low: Boolean(p.estimated_days_remaining !== null && p.estimated_days_remaining <= 3),
        complete: p.status === 'completed',
      }

      const items: ScheduleItem[] = brand.schedule.map((day) => ({
        day,
        state: completedDays.includes(day)
          ? 'completed'
          : day === summary.currentDay && !summary.complete
          ? 'scheduled'
          : 'upcoming',
      }))

      return { brand, customer, summary, items, isLiveSession: true }
    } catch {
      return null
    }
  }

  // Under NO circumstances may an anonymous request receive customer dashboard data.
  // Real customer capability session token verified against database is strictly required.
  return null
}

/**
 * Persists today's scheduled usage completion to public.program_usage via RPC.
 */
export async function completeScheduledUsage(brandSlug: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const supabase = getSupabaseClient()

  if (supabase) {
    if (!sessionToken) return { success: false, error: 'Unauthorized: active session required' }
    try {
      const { data, error } = await supabase.rpc('customer_complete_today', {
        p_brand_slug: brandSlug,
        p_capability: sessionToken,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' }
    }
  }

  return { success: false, error: 'Program service unavailable' }
}

/**
 * Reverts today's scheduled usage completion in public.program_usage via RPC.
 */
export async function undoScheduledUsage(brandSlug: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const supabase = getSupabaseClient()

  if (supabase) {
    if (!sessionToken) return { success: false, error: 'Unauthorized: active session required' }
    try {
      const { data, error } = await supabase.rpc('customer_undo_today', {
        p_brand_slug: brandSlug,
        p_capability: sessionToken,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' }
    }
  }

  return { success: false, error: 'Program service unavailable' }
}
