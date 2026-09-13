import { notFound } from 'next/navigation'
import { getCustomerDashboard } from '@/lib/services/customer-service'
import { DashboardScreen } from '@/components/customer'

export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const dashboard = await getCustomerDashboard(brandSlug)
  if (!dashboard) notFound()

  return (
    <DashboardScreen
      brand={dashboard.brand}
      customer={dashboard.customer}
      initialSummary={dashboard.summary}
      initialItems={dashboard.items}
    />
  )
}
