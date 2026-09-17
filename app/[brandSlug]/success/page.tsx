import { notFound, redirect } from 'next/navigation'
import { getSubscriptionState } from '@/lib/stripe/customer'
import { resolveBrand } from '@/lib/services/customer-service'
import { SuccessScreen } from '@/components/customer'

export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const brand = await resolveBrand(brandSlug)
  if (!brand) notFound()
  const subscription = await getSubscriptionState(brandSlug)
  if (!subscription) redirect(`/${brandSlug}/start`)
  return <SuccessScreen brand={brand} initialSubscription={subscription} />
}
