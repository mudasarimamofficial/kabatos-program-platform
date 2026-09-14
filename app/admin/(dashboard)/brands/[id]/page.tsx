import { notFound } from 'next/navigation'
import { getAdminBrandBySlug, saveAdminBrand } from '@/lib/services/admin-service'
import { BrandEditor } from '@/components/admin'
import type { BrandForm } from '@/lib/types'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getAdminBrandBySlug(id)
  if (!brand) notFound()

  async function handleSave(form: BrandForm) {
    'use server'
    return await saveAdminBrand(form, 'edit', id)
  }

  return <BrandEditor brand={brand} mode="edit" onSave={handleSave} />
}
