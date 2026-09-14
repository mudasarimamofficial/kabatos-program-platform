import { getAdminBrands } from '@/lib/services/admin-service'
import { BrandRoster } from '@/components/admin'

export default async function Page() {
  const brands = await getAdminBrands()
  return <BrandRoster brands={brands} />
}
