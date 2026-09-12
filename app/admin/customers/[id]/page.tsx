import { notFound } from 'next/navigation'
import { customers } from '@/lib/mock/data'
import { CustomerDetail } from '@/components/admin'
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const customer = customers.find((item) => item.id === id); if (!customer) notFound(); return <CustomerDetail customer={customer} /> }
