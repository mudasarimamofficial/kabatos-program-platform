import type { Brand, Customer, ProgramSummary, ScheduleItem } from '@/lib/types'
const RUNNING_LOW_THRESHOLD_DAYS = 3
export function getSummary(brand: Brand, customer: Customer): ProgramSummary { const currentDay = Math.min(Math.max(customer.currentDay, 1), brand.duration); const complete = customer.programStatus === 'completed' || currentDay >= brand.duration; const remainingDays = Math.max(brand.duration - currentDay, 0); const scheduledToday = brand.schedule.includes(currentDay) && !customer.completedDays.includes(currentDay) && !complete; const nextScheduledDay = brand.schedule.find((day) => day >= currentDay && !customer.completedDays.includes(day)); return { currentDay, progressPercent: Math.min(100, Math.round((currentDay / brand.duration) * 100)), remainingDays, nextScheduledDay, scheduledToday, low: !complete && remainingDays <= RUNNING_LOW_THRESHOLD_DAYS, complete } }
export function getScheduleItems(brand: Brand, customer: Customer): ScheduleItem[] { const summary = getSummary(brand, customer); return brand.schedule.map((day) => ({ day, state: customer.completedDays.includes(day) ? 'completed' : day === summary.currentDay && !summary.complete ? 'scheduled' : 'upcoming' })) }
export function addScheduleDay(days: number[], day: number, duration: number) { if (!Number.isInteger(day) || day < 1 || day > duration || days.includes(day)) return days; return [...days, day].sort((a, b) => a - b) }
export function removeScheduleDay(days: number[], day: number) { return days.filter((item) => item !== day) }

export function getCurrentProgramDay(customer: Customer, duration: number) {
  return Math.min(Math.max(Math.trunc(customer.currentDay), 1), Math.max(duration, 1))
}

export function getProgressPercent(currentDay: number, duration: number) {
  if (duration <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((currentDay / duration) * 100)))
}

export function getEstimatedRemainingDays(currentDay: number, duration: number) {
  return Math.max(duration - currentDay, 0)
}

export function getNextScheduledUsage(schedule: number[], currentDay: number, completedDays: number[] = []) {
  return normalizeSchedule(schedule).find((day) => day >= currentDay && !completedDays.includes(day))
}

export function isUsageScheduledToday(schedule: number[], currentDay: number, completedDays: number[] = []) {
  return schedule.includes(currentDay) && !completedDays.includes(currentDay)
}

export function isRunningLow(currentDay: number, duration: number, threshold = RUNNING_LOW_THRESHOLD_DAYS) {
  return getEstimatedRemainingDays(currentDay, duration) <= threshold && currentDay < duration
}

export function isProgramComplete(currentDay: number, duration: number, status?: Customer['programStatus']) {
  return status === 'completed' || currentDay >= duration
}

export function normalizeSchedule(days: number[]) {
  return [...new Set(days.filter((day) => Number.isInteger(day) && day > 0))].sort((a, b) => a - b)
}

export function validateSchedule(days: number[], duration: number) {
  const normalized = normalizeSchedule(days)
  if (!Number.isInteger(duration) || duration <= 0) return { valid: false, message: 'Duration must be a positive integer.' }
  if (normalized.some((day) => day > duration)) return { valid: false, message: 'Schedule days must fit within the program duration.' }
  return { valid: true as const, message: undefined }
}
