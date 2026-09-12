import { getAdminBrands } from '@/lib/services/admin-service'
import { AccessLinks } from '@/components/admin'

export default async function Page() {
  const brands = await getAdminBrands()
  return <AccessLinks brands={brands} />
}
