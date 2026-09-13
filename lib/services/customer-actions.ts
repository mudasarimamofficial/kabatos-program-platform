'use server'

import { joinProgram, completeScheduledUsage, undoScheduledUsage } from './customer-service'

export async function joinCustomerProgramAction(data: {
  brandSlug: string
  firstName: string
  email?: string
  phone?: string
  orderNumber?: string
}) {
  return await joinProgram(data)
}

export async function completeScheduledUsageAction(brandSlug: string) {
  return await completeScheduledUsage(brandSlug)
}

export async function undoScheduledUsageAction(brandSlug: string) {
  return await undoScheduledUsage(brandSlug)
}
