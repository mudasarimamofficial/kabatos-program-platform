import { getAdminCustomers } from '@/lib/services/admin-service'
import { CustomerRoster } from '@/components/admin'

export default async function Page() {
  const customers = await getAdminCustomers()
  return <CustomerRoster customers={customers} />
}
