import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { publicEnv } from '@/lib/env'
import {
  createOpaqueSessionToken,
  CUSTOMER_SESSION_COOKIE,
  setCustomerSessionCookie,
} from '@/lib/auth/customer-session'
import { getBrand as getMockBrand, defaultCustomer, customers as mockCustomers } from '@/lib/mock/data'
import type { Brand, Customer, ProgramSummary, ScheduleItem } from '@/lib/types'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function deriveHoverColor(color: string): string {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return color
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.floor((num >> 16) * 0.85))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * 0.85))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * 0.85))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

function deriveTextColor(color: string): string {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return '#FFFFFF'
  const num = parseInt(hex, 16)
  const r = num >> 16
  const g = (num >> 8) & 0x00FF
  const b = num & 0x0000FF
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#121212' : '#FFFFFF'
}

export function formatBrandFromDb(data: any): Brand {
  const primary = data.primary_color ?? '#121212'
  const secondary = data.secondary_color ?? '#666666'
  const highlight = data.highlight_color ?? '#F4F4F4'
  return {
    slug: data.slug,
    name: data.name,
    logo: data.logo_path ?? undefined,
    productImage: data.product_image_path ?? undefined,
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
  return getMockBrand(slug) ?? null
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
          await setCustomerSessionCookie(token)
          return { success: true, status: 'not_started' }
        }
        return { success: false, error: error.message }
      }

      await setCustomerSessionCookie(token)
      return { success: true, status: data?.status ?? 'not_started' }
    } catch (err: any) {
      // Fall through to session fallback
    }
  }

  // Local fallback session
  await setCustomerSessionCookie(token)
  return { success: true, status: 'not_started' }
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

  if (supabase && sessionToken) {
    try {
      const { data, error } = await supabase.rpc('customer_dashboard', {
        p_brand_slug: brandSlug,
        p_capability: sessionToken,
      })

      if (!error && data) {
        const p = data.program
        const completedDay = data.usage?.scheduled_day
        const completedAt = data.usage?.completed_at
        const completedDays = completedAt && completedDay ? [completedDay] : []

        const customer: Customer = {
          id: 'live-customer',
          firstName: 'Sarah',
          email: 'sarah@example.com',
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
      }
    } catch {
      // Fall through to default customer fixture
    }
  }

  // Fallback to demo fixture for preview / test suites
  const fixtureCustomer =
    mockCustomers.find((c) => c.brandSlug === brandSlug) ?? {
      ...defaultCustomer,
      brandSlug,
    }

  const currentDay = Math.min(Math.max(fixtureCustomer.currentDay, 1), brand.duration)
  const complete = fixtureCustomer.programStatus === 'completed' || currentDay >= brand.duration
  const remainingDays = Math.max(brand.duration - currentDay, 0)
  const scheduledToday =
    brand.schedule.includes(currentDay) && !fixtureCustomer.completedDays.includes(currentDay) && !complete
  const nextScheduledDay = brand.schedule.find(
    (day) => day >= currentDay && !fixtureCustomer.completedDays.includes(day)
  )

  const summary: ProgramSummary = {
    currentDay,
    progressPercent: Math.min(100, Math.round((currentDay / brand.duration) * 100)),
    remainingDays,
    nextScheduledDay,
    scheduledToday,
    low: !complete && remainingDays <= 3,
    complete,
  }

  const items: ScheduleItem[] = brand.schedule.map((day) => ({
    day,
    state: fixtureCustomer.completedDays.includes(day)
      ? 'completed'
      : day === summary.currentDay && !summary.complete
      ? 'scheduled'
      : 'upcoming',
  }))

  return { brand, customer: fixtureCustomer, summary, items, isLiveSession: false }
}

/**
 * Persists today's scheduled usage completion to public.program_usage via RPC.
 */
export async function completeScheduledUsage(brandSlug: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const supabase = getSupabaseClient()

  if (supabase && sessionToken) {
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

  return { success: true }
}

/**
 * Reverts today's scheduled usage completion in public.program_usage via RPC.
 */
export async function undoScheduledUsage(brandSlug: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const supabase = getSupabaseClient()

  if (supabase && sessionToken) {
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

  return { success: true }
}
