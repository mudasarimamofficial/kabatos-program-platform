import { notFound } from 'next/navigation'
import { resolveBrand } from '@/lib/services/customer-service'
import { WelcomeScreen } from '@/components/customer'

export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const brand = await resolveBrand(brandSlug)
  if (!brand) notFound()
  return <WelcomeScreen brand={brand} />
}

export function generateStaticParams() {
  return [{ brandSlug: 'comprex' }, { brandSlug: 'demo-wellness' }]
}
