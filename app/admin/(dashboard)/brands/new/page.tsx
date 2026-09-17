import { saveAdminBrand } from '@/lib/services/admin-service'
import { BrandEditor } from '@/components/admin'
import type { BrandForm } from '@/lib/types'
import { requireAdminSession } from '@/lib/auth/admin-auth'

export default async function Page() {
  await requireAdminSession()
  async function handleSave(form: BrandForm) {
    'use server'
    return await saveAdminBrand(form, 'create')
  }

  return <BrandEditor mode="create" onSave={handleSave} />
}
