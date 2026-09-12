import { describe, expect, it } from 'vitest'
import {
  calculateCalendarDayDifference,
  computeProgramSummary,
  getCurrentProgramDay,
  getEstimatedRemainingDays,
  getNextScheduledUsage,
  getProgressPercent,
  isProgramComplete,
  isRunningLow,
  isUsageScheduledToday,
  normalizeSchedule,
  validateSchedule,
  type CustomerProgramState,
} from './index'

describe('Program Engine: Pure Domain Logic', () => {
  const comprexSchedule = [1, 3, 5, 7, 9, 11, 13]
  const comprexDuration = 14

  describe('Calendar Date Math', () => {
    it('calculates Day 1 on same calendar date as start date', () => {
      const diff = calculateCalendarDayDifference('2026-09-01', '2026-09-01')
      expect(diff).toBe(1)
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-09-01')).toBe(1)
    })

    it('calculates day rollover accurately across calendar days', () => {
      expect(calculateCalendarDayDifference('2026-09-01', '2026-09-02')).toBe(2)
      expect(calculateCalendarDayDifference('2026-09-01', '2026-09-05')).toBe(5)
      expect(calculateCalendarDayDifference('2026-09-01', '2026-09-14')).toBe(14)
      expect(calculateCalendarDayDifference('2026-09-01', '2026-09-15')).toBe(15)
    })

    it('bounds currentDay within [1, duration]', () => {
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-08-30')).toBe(1)
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-09-01')).toBe(1)
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-09-07')).toBe(7)
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-09-14')).toBe(14)
      expect(getCurrentProgramDay('2026-09-01', 14, '2026-09-25')).toBe(14)
    })
  })

  describe('Progress Calculation', () => {
    it('calculates bounded progress percentage', () => {
      expect(getProgressPercent(1, 14)).toBe(7)
      expect(getProgressPercent(7, 14)).toBe(50)
      expect(getProgressPercent(14, 14)).toBe(100)
      expect(getProgressPercent(20, 14)).toBe(100)
      expect(getProgressPercent(0, 14)).toBe(0)
    })
  })

  describe('Remaining Days', () => {
    it('calculates estimated remaining days', () => {
      expect(getEstimatedRemainingDays(1, 14)).toBe(13)
      expect(getEstimatedRemainingDays(7, 14)).toBe(7)
      expect(getEstimatedRemainingDays(14, 14)).toBe(0)
      expect(getEstimatedRemainingDays(15, 14)).toBe(0)
    })
  })

  describe('Schedule Normalization and Validation', () => {
    it('normalizes unsorted, duplicate, and non-positive schedule days', () => {
      expect(normalizeSchedule([7, 3, 1, 3, 5, 0, -2, 7])).toEqual([1, 3, 5, 7])
    })

    it('validates schedule bounds against duration', () => {
      expect(validateSchedule([1, 3, 5], 14).valid).toBe(true)
      expect(validateSchedule([1, 15], 14).valid).toBe(false)
      expect(validateSchedule([], 14).valid).toBe(false)
      expect(validateSchedule([1], 0).valid).toBe(false)
    })
  })

  describe('Next Scheduled Usage & Today State', () => {
    it('identifies scheduled usage today on scheduled days', () => {
      expect(isUsageScheduledToday(comprexSchedule, 1, [])).toBe(true)
      expect(isUsageScheduledToday(comprexSchedule, 1, [1])).toBe(false)
      expect(isUsageScheduledToday(comprexSchedule, 2, [])).toBe(false) // Off-day
      expect(isUsageScheduledToday(comprexSchedule, 3, [])).toBe(true)
    })

    it('correctly determines next scheduled day', () => {
      // On Day 1 before completion -> next is Day 1
      expect(getNextScheduledUsage(comprexSchedule, 1, [])).toBe(1)
      // On Day 1 after completing Day 1 -> next is Day 3
      expect(getNextScheduledUsage(comprexSchedule, 1, [1])).toBe(3)
      // On off-day Day 2 -> next is Day 3
      expect(getNextScheduledUsage(comprexSchedule, 2, [1])).toBe(3)
      // On Day 13 after completing Day 13 -> undefined (all future completed)
      expect(getNextScheduledUsage(comprexSchedule, 13, [1, 3, 5, 7, 9, 11, 13])).toBeUndefined()
    })
  })

  describe('Running Low Calculation', () => {
    it('triggers running low when remaining days <= threshold and not past duration', () => {
      expect(isRunningLow(10, 14, 3)).toBe(false) // 4 days remaining
      expect(isRunningLow(11, 14, 3)).toBe(true)  // 3 days remaining
      expect(isRunningLow(12, 14, 3)).toBe(true)  // 2 days remaining
      expect(isRunningLow(13, 14, 3)).toBe(true)  // 1 day remaining
      expect(isRunningLow(14, 14, 3)).toBe(false) // final day is ending / completed
    })
  })

  describe('Program Completion Calculation', () => {
    it('marks program complete when rawDay exceeds duration or status is completed', () => {
      expect(isProgramComplete(14, 14)).toBe(false)
      expect(isProgramComplete(15, 14)).toBe(true)
      expect(isProgramComplete(5, 14, 'completed')).toBe(true)
    })
  })

  describe('Comprehensive Program Summary', () => {
    it('computes coherent state for active customer on Day 5', () => {
      const state: CustomerProgramState = {
        startDate: '2026-09-01',
        snapshot: { durationDays: 14, usageSchedule: comprexSchedule, runningLowDays: 3 },
        completedDays: [1, 3],
        status: 'active',
      }
      const summary = computeProgramSummary(state, '2026-09-05')
      expect(summary.currentDay).toBe(5)
      expect(summary.progressPercent).toBe(36)
      expect(summary.remainingDays).toBe(9)
      expect(summary.scheduledToday).toBe(true)
      expect(summary.nextScheduledDay).toBe(5)
      expect(summary.isRunningLow).toBe(false)
      expect(summary.isComplete).toBe(false)
    })

    it('computes coherent state for off-day (Day 6)', () => {
      const state: CustomerProgramState = {
        startDate: '2026-09-01',
        snapshot: { durationDays: 14, usageSchedule: comprexSchedule, runningLowDays: 3 },
        completedDays: [1, 3, 5],
        status: 'active',
      }
      const summary = computeProgramSummary(state, '2026-09-06')
      expect(summary.currentDay).toBe(6)
      expect(summary.scheduledToday).toBe(false)
      expect(summary.nextScheduledDay).toBe(7)
      expect(summary.isRunningLow).toBe(false)
      expect(summary.isComplete).toBe(false)
    })

    it('computes running low state on Day 12 without fabricating completion', () => {
      const state: CustomerProgramState = {
        startDate: '2026-09-01',
        snapshot: { durationDays: 14, usageSchedule: comprexSchedule, runningLowDays: 3 },
        completedDays: [1, 3, 7], // Missed Day 5 and Day 9 (not fabricated!)
        status: 'active',
      }
      const summary = computeProgramSummary(state, '2026-09-12')
      expect(summary.currentDay).toBe(12)
      expect(summary.remainingDays).toBe(2)
      expect(summary.isRunningLow).toBe(true)
      expect(summary.scheduledToday).toBe(false) // Day 12 is off-day
      expect(summary.nextScheduledDay).toBe(13)
      expect(summary.isComplete).toBe(false)
    })
  })
})
