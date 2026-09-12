import { notFound } from 'next/navigation'
import { resolveBrand, joinProgram } from '@/lib/services/customer-service'
import { StartScreen } from '@/components/customer'

export default async function Page({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const brand = await resolveBrand(brandSlug)
  if (!brand) notFound()

  async function handleJoin(data: {
    firstName: string
    email?: string
    phone?: string
    orderNumber?: string
  }) {
    'use server'
    return await joinProgram({
      brandSlug,
      firstName: data.firstName,
      email: data.email,
      phone: data.phone,
      orderNumber: data.orderNumber,
    })
  }

  return <StartScreen brand={brand} onJoin={handleJoin} />
}
