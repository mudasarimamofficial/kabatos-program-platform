/**
 * Kabatos Program Platform / COMPREX
 * Pure TypeScript Program Domain Engine
 *
 * Implements deterministic calendar-date math, schedule normalization,
 * adherence tracking, and snapshot immutability calculations.
 */

export const DEFAULT_RUNNING_LOW_THRESHOLD_DAYS = 3

export interface ProgramSnapshot {
  durationDays: number
  usageSchedule: number[]
  runningLowDays?: number
}

export interface CustomerProgramState {
  startDate: string | Date
  snapshot: ProgramSnapshot
  completedDays: number[]
  status?: 'not_started' | 'active' | 'completed'
}

export interface ProgramSummary {
  currentDay: number
  rawDay: number
  progressPercent: number
  remainingDays: number
  nextScheduledDay?: number
  scheduledToday: boolean
  isRunningLow: boolean
  isComplete: boolean
}

/**
 * Parses an ISO date string (YYYY-MM-DD or full ISO) or Date into deterministic UTC/calendar date parts.
 */
export function parseCalendarDate(input: string | Date): { year: number; month: number; day: number } {
  if (input instanceof Date) {
    return {
      year: input.getUTCFullYear(),
      month: input.getUTCMonth(),
      day: input.getUTCDate(),
    }
  }

  // Handle YYYY-MM-DD directly to prevent local timezone offsets
  const match = String(input).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[3], 10),
    }
  }

  const d = new Date(input)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
  }
}

/**
 * Calculates deterministic day difference between two calendar dates (start and current).
 * Returns raw elapsed day number (Day 1 is startDate).
 */
export function calculateCalendarDayDifference(startDate: string | Date, targetDate: string | Date = new Date()): number {
  const start = parseCalendarDate(startDate)
  const target = parseCalendarDate(targetDate)

  const utcStart = Date.UTC(start.year, start.month, start.day)
  const utcTarget = Date.UTC(target.year, target.month, target.day)

  const msPerDay = 86400000
  const diffDays = Math.floor((utcTarget - utcStart) / msPerDay)
  return diffDays + 1
}

/**
 * Returns current bounded program day (between 1 and duration).
 */
export function getCurrentProgramDay(startDate: string | Date, duration: number, asOfDate?: string | Date): number {
  const rawDay = calculateCalendarDayDifference(startDate, asOfDate)
  if (duration <= 0) return 1
  return Math.min(Math.max(rawDay, 1), duration)
}

/**
 * Progress percent: currentDay / duration * 100, bounded 0-100.
 */
export function getProgressPercent(currentDay: number, duration: number): number {
  if (duration <= 0) return 0
  const boundedDay = Math.min(Math.max(currentDay, 0), duration)
  return Math.min(100, Math.max(0, Math.round((boundedDay / duration) * 100)))
}

/**
 * Returns estimated days remaining based on elapsed days.
 */
export function getEstimatedRemainingDays(currentDay: number, duration: number): number {
  if (duration <= 0) return 0
  return Math.max(0, duration - currentDay)
}

/**
 * Normalizes schedule array: positive integers, unique, sorted ascending.
 */
export function normalizeSchedule(days: number[]): number[] {
  return [...new Set(days.filter((d) => Number.isInteger(d) && d > 0))].sort((a, b) => a - b)
}

/**
 * Validates schedule against duration.
 */
export function validateSchedule(days: number[], duration: number): { valid: boolean; message?: string } {
  if (!Number.isInteger(duration) || duration <= 0) {
    return { valid: false, message: 'Program duration must be a positive integer.' }
  }
  const normalized = normalizeSchedule(days)
  if (normalized.length === 0) {
    return { valid: false, message: 'Schedule must contain at least one scheduled day.' }
  }
  if (normalized.some((day) => day > duration)) {
    return { valid: false, message: 'Scheduled days cannot exceed program duration.' }
  }
  return { valid: true }
}

/**
 * Finds next scheduled day that belongs to snapshot, has not been completed, and is >= currentDay.
 */
export function getNextScheduledUsage(
  schedule: number[],
  currentDay: number,
  completedDays: number[] = []
): number | undefined {
  const normalized = normalizeSchedule(schedule)
  const completedSet = new Set(completedDays)
  return normalized.find((day) => day >= currentDay && !completedSet.has(day))
}

/**
 * Checks if today is a scheduled usage day and not yet completed.
 */
export function isUsageScheduledToday(
  schedule: number[],
  currentDay: number,
  completedDays: number[] = []
): boolean {
  const normalized = normalizeSchedule(schedule)
  const completedSet = new Set(completedDays)
  return normalized.includes(currentDay) && !completedSet.has(currentDay)
}

/**
 * Checks whether program product is estimated to be running low.
 * Threshold is based on estimated remaining days (default <= 3 days).
 */
export function isRunningLow(
  currentDay: number,
  duration: number,
  threshold: number = DEFAULT_RUNNING_LOW_THRESHOLD_DAYS
): boolean {
  if (duration <= 0 || currentDay >= duration) return false
  const remaining = getEstimatedRemainingDays(currentDay, duration)
  return remaining <= threshold
}

/**
 * Determines whether program is complete.
 * Program is complete when status is 'completed' or elapsed calendar day exceeds duration.
 */
export function isProgramComplete(
  rawDay: number,
  duration: number,
  explicitStatus?: 'not_started' | 'active' | 'completed'
): boolean {
  if (explicitStatus === 'completed') return true
  return duration > 0 && rawDay > duration
}

/**
 * Computes authoritative summary for customer program.
 */
export function computeProgramSummary(program: CustomerProgramState, asOfDate?: string | Date): ProgramSummary {
  const duration = program.snapshot.durationDays
  const schedule = program.snapshot.usageSchedule
  const threshold = program.snapshot.runningLowDays ?? DEFAULT_RUNNING_LOW_THRESHOLD_DAYS

  const rawDay = calculateCalendarDayDifference(program.startDate, asOfDate)
  const currentDay = getCurrentProgramDay(program.startDate, duration, asOfDate)
  const isComplete = isProgramComplete(rawDay, duration, program.status)
  const progressPercent = getProgressPercent(currentDay, duration)
  const remainingDays = getEstimatedRemainingDays(currentDay, duration)

  const scheduledToday = !isComplete && isUsageScheduledToday(schedule, currentDay, program.completedDays)
  const nextScheduledDay = isComplete ? undefined : getNextScheduledUsage(schedule, currentDay, program.completedDays)
  const low = !isComplete && isRunningLow(currentDay, duration, threshold)

  return {
    currentDay,
    rawDay,
    progressPercent,
    remainingDays,
    nextScheduledDay,
    scheduledToday,
    isRunningLow: low,
    isComplete,
  }
}
