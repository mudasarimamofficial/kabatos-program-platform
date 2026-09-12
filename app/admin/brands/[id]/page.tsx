import { notFound } from 'next/navigation'
import { brands } from '@/lib/mock/data'
import { BrandEditor } from '@/components/admin'
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const brand = brands.find((item) => item.slug === id); if (!brand) notFound(); return <BrandEditor brand={brand} mode="edit" /> }
