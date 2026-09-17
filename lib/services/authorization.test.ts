import { beforeEach, expect, it, vi } from 'vitest'
const { guard, client } = vi.hoisted(() => ({ guard: vi.fn(), client: vi.fn() }))
vi.mock('@/lib/auth/admin-auth', () => ({ requireAdminSession: guard }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: client }))
import { getAdminDashboardMetrics, getAdminBrands, getAdminCustomers, getAdminCustomerDetail, saveAdminBrand } from './admin-service'

beforeEach(() => { vi.resetAllMocks() })
it('guards every admin data entry point before creating any privileged client', async () => {
  guard.mockRejectedValue(new Error('NEXT_REDIRECT:/admin/login'))
  const calls = [() => getAdminDashboardMetrics(), () => getAdminBrands(), () => getAdminCustomers(), () => getAdminCustomerDetail('any'), () => saveAdminBrand({} as any, 'create')]
  for (const call of calls) await expect(call()).rejects.toThrow('NEXT_REDIRECT')
  expect(client).not.toHaveBeenCalled()
})
it('allows an authorized read through the user-scoped RPC client', async () => {
  guard.mockResolvedValue({ id: 'authorized' })
  client.mockResolvedValue({ rpc: vi.fn().mockResolvedValue({ data: { brands: 2, customers: 0, active_programs: 0, active_subscriptions: 0 } }) })
  expect(await getAdminDashboardMetrics()).toEqual({ totalBrands: 2, totalCustomers: 0, activePrograms: 0, activeSubscriptions: 0 })
})
