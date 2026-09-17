import { redirect } from 'next/navigation'
import { getCustomerDashboard } from '@/lib/services/customer-service'
import { DashboardScreen } from '@/components/customer'
import { getSubscriptionState } from '@/lib/stripe/customer'
import { SubscriptionCard } from '@/components/customer/subscription-card'
import { CustomerShell } from '@/components/customer/customer-shell'
import { resolveBrand } from '@/lib/services/customer-service'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const dashboard = await getCustomerDashboard(brandSlug)
  const subscription = await getSubscriptionState(brandSlug)
  if (!dashboard) {
    if (subscription) {
      const brand = await resolveBrand(brandSlug)
      if (brand) return <CustomerShell brand={brand}><main className="customer-main"><h2>Tracking access unavailable</h2><SubscriptionCard brandSlug={brandSlug} initialState={subscription} /></main></CustomerShell>
    }
    redirect(`/${brandSlug}`)
  }

  return (
    <DashboardScreen
      brand={dashboard.brand}
      customer={dashboard.customer}
      initialSummary={dashboard.summary}
      initialItems={dashboard.items}
      subscription={subscription ?? undefined}
    />
  )
}
