import { getAdminDashboardMetrics, getAdminCustomers } from '@/lib/services/admin-service'
import { AdminOverview } from '@/components/admin'

export default async function Page() {
  const metrics = await getAdminDashboardMetrics()
  const customers = await getAdminCustomers()
  return <AdminOverview metrics={metrics} customers={customers} />
}
