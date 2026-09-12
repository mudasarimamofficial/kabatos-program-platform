import type { Brand, Customer } from '@/lib/types'

export type CustomerProgramSnapshot = Pick<Brand, 'duration' | 'schedule' | 'reorderUrl' | 'productName'> & { brandSlug: string; customerId: string }

export function snapshotProgram(brand: Brand, customer: Pick<Customer, 'id'>): CustomerProgramSnapshot {
  return { brandSlug: brand.slug, customerId: customer.id, duration: brand.duration, schedule: [...brand.schedule], reorderUrl: brand.reorderUrl, productName: brand.productName }
}

export function snapshotIsStable(snapshot: CustomerProgramSnapshot, brand: Brand) {
  return snapshot.duration !== brand.duration || snapshot.schedule.join(',') !== brand.schedule.join(',') || snapshot.productName !== brand.productName
}
