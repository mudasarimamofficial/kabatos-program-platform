import type { AdminMetrics, Brand, Customer } from '@/lib/types'

export const brands: Brand[] = [
  { slug: 'comprex', name: 'COMPREX', logo: '/brands/comprex/logo.png', productImage: '/brands/comprex/product-pouch.jpg', productName: 'Daily Wellness', duration: 14, schedule: [1, 3, 5, 7, 9, 11, 13], usageTitle: 'Your scheduled use', usageInstructions: 'Take ~1 teaspoon in warm water before bedtime.', reorderUrl: '#mock-reorder', status: 'active', theme: { primary: '#F07106', primaryHover: '#D85800', primaryText: '#121212', secondary: '#8B6F47', highlight: '#FDEEE1', highlightBorder: '#F6C79E' } },
  { slug: 'demo-wellness', name: 'Demo Wellness', productName: 'Daily Balance', duration: 10, schedule: [1, 3, 5, 7, 9], usageTitle: 'Your scheduled use', usageInstructions: 'Follow the directions provided with your product.', reorderUrl: 'https://example.com/reorder', status: 'active', theme: { primary: '#2F7D72', primaryHover: '#245F57', primaryText: '#FFFFFF', secondary: '#5F716D', highlight: '#E4F1ED', highlightBorder: '#B8D9D0' } },
]
export const customers: Customer[] = [
  { id: 'sarah-chen', firstName: 'Sarah', email: 'sarah.chen@email.com', orderNumber: 'CX-1042', brandSlug: 'comprex', startDate: 'Sep 5, 2026', currentDay: 5, programStatus: 'active', subscriptionStatus: 'active', completedDays: [1, 3] },
  { id: 'jordan-williams', firstName: 'Jordan', email: 'jordan.w@email.com', brandSlug: 'comprex', startDate: 'Aug 29, 2026', currentDay: 12, programStatus: 'active', subscriptionStatus: 'active', completedDays: [1, 3, 5, 7, 9, 11] },
  { id: 'demo-customer', firstName: 'Alex', email: 'alex@demo-wellness.test', brandSlug: 'demo-wellness', startDate: 'Sep 1, 2026', currentDay: 4, programStatus: 'active', subscriptionStatus: 'active', completedDays: [1, 3] },
]
export const metrics: AdminMetrics = { totalBrands: brands.length, totalCustomers: customers.length, activePrograms: customers.filter((customer) => customer.programStatus === 'active').length, activeSubscriptions: customers.filter((customer) => customer.subscriptionStatus === 'active').length }
export function getBrand(slug: string) { return brands.find((brand) => brand.slug === slug) }
export function getCustomer(id = 'sarah-chen') { return customers.find((customer) => customer.id === id) }
export const defaultBrand = brands[0]
export const defaultCustomer = customers[0]
