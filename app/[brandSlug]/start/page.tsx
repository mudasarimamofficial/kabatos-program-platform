import { notFound } from 'next/navigation'
import { getBrand } from '@/lib/mock/data'
import { StartScreen } from '@/components/customer'
export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) { const { brandSlug } = await params; const brand = getBrand(brandSlug); if (!brand) notFound(); return <StartScreen brand={brand} /> }
