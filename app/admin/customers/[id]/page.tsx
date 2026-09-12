import { notFound } from 'next/navigation'
import { getAdminCustomerDetail } from '@/lib/services/admin-service'
import { CustomerDetail } from '@/components/admin'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getAdminCustomerDetail(id)
  if (!customer) notFound()
  return <CustomerDetail customer={customer} />
}
