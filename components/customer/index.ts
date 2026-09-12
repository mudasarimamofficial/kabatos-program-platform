export * from './brand-logo'
export * from './customer-shell'
export * from './buttons'
export * from './welcome-screen'
export * from './start-screen'
export * from './activate-screen'
export * from './checkout-screen'
export * from './success-screen'
export * from './dashboard-screen'
export * from './error-screen'

import { customers, defaultCustomer, getCustomer } from '@/lib/mock/data'
import type { Brand } from '@/lib/types'

export const getCustomerForBrand = (brand: Brand) =>
  customers.find((customer) => customer.brandSlug === brand.slug) ?? {
    ...defaultCustomer,
    brandSlug: brand.slug,
  }

export const getCustomerById = (id: string) => getCustomer(id)
