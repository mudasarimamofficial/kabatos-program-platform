import { notFound } from 'next/navigation'
import { getBrand, getCustomer } from '@/lib/mock/data'
import { DashboardScreen } from '@/components/customer'
export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) { const { brandSlug } = await params; const brand = getBrand(brandSlug); if (!brand) notFound(); const customer = getCustomer(brandSlug === 'comprex' ? 'sarah-chen' : 'demo-customer');
  if (!customer || customer.brandSlug !== brandSlug) notFound(); return <DashboardScreen brand={brand} customer={customer} /> }
