import { saveAdminBrand } from '@/lib/services/admin-service'
import { BrandEditor } from '@/components/admin'
import type { BrandForm } from '@/lib/types'

export default function Page() {
  async function handleSave(form: BrandForm) {
    'use server'
    return await saveAdminBrand(form, 'create')
  }

  return <BrandEditor mode="create" onSave={handleSave} />
}
