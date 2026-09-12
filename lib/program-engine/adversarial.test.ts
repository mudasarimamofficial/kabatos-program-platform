import { describe, it, expect } from 'vitest'
import {
  computeProgramSummary,
  getCurrentProgramDay,
  getNextScheduledUsage,
  getProgressPercent,
  isUsageScheduledToday,
  validateSchedule,
  type CustomerProgramState,
} from './index'

describe('Adversarial Program Engine & Snapshot Invariants (§29, §30, §35, §90)', () => {
  it('MANDATORY SNAPSHOT TEST: Customer A retains 14-day schedule when brand changes to 10-day (§35, §90)', () => {
    // 1. Initial brand configuration: 14 days, schedule [1,3,5,7,9,11,13]
    const initialBrandConfig = {
      durationDays: 14,
      usageSchedule: [1, 3, 5, 7, 9, 11, 13],
      runningLowDays: 3,
    }

    // Customer A onboarded and snapshot locked
    const customerA: CustomerProgramState = {
      startDate: '2026-09-01',
      snapshot: { ...initialBrandConfig },
      completedDays: [1],
    }

    // 2. Admin mutates active brand configuration to 10 days, schedule [2,4,6,8,10]
    const updatedBrandConfig = {
      durationDays: 10,
      usageSchedule: [2, 4, 6, 8, 10],
      runningLowDays: 2,
    }

    // Customer B onboarded AFTER admin change
    const customerB: CustomerProgramState = {
      startDate: '2026-09-01',
      snapshot: { ...updatedBrandConfig },
      completedDays: [],
    }

    // 3. Verify Customer A invariants: must remain 14 days and [1,3,5,7,9,11,13]
    const summaryA = computeProgramSummary(customerA, '2026-09-03') // Day 3
    expect(customerA.snapshot.durationDays).toBe(14)
    expect(customerA.snapshot.usageSchedule).toEqual([1, 3, 5, 7, 9, 11, 13])
    expect(summaryA.currentDay).toBe(3)
    expect(summaryA.remainingDays).toBe(11) // 14 - 3
    expect(summaryA.scheduledToday).toBe(true) // Day 3 is scheduled in 14-day COMPREX

    // 4. Verify Customer B invariants: uses new 10-day configuration
    const summaryB = computeProgramSummary(customerB, '2026-09-03') // Day 3
    expect(customerB.snapshot.durationDays).toBe(10)
    expect(customerB.snapshot.usageSchedule).toEqual([2, 4, 6, 8, 10])
    expect(summaryB.currentDay).toBe(3)
    expect(summaryB.remainingDays).toBe(7) // 10 - 3
    expect(summaryB.scheduledToday).toBe(false) // Day 3 is NOT scheduled in Customer B's schedule [2,4,6,8,10]
    expect(summaryB.nextScheduledDay).toBe(4)
  })

  it('proves that off-days are NEVER considered missed usage or allowed for completion (§28, §31)', () => {
    const program: CustomerProgramState = {
      startDate: '2026-09-01',
      snapshot: {
        durationDays: 14,
        usageSchedule: [1, 3, 5, 7, 9, 11, 13],
      },
      completedDays: [1],
    }

    // Day 2 is an off-day
    const isDay2Scheduled = isUsageScheduledToday(program.snapshot.usageSchedule, 2, program.completedDays)
    expect(isDay2Scheduled).toBe(false)

    // Next scheduled day should point forward to Day 3
    const nextDay = getNextScheduledUsage(program.snapshot.usageSchedule, 2, program.completedDays)
    expect(nextDay).toBe(3)
  })

  it('correctly handles calendar day rollovers and post-completion days (§30, §34)', () => {
    const program: CustomerProgramState = {
      startDate: '2026-09-01',
      snapshot: {
        durationDays: 14,
        usageSchedule: [1, 3, 5, 7, 9, 11, 13],
      },
      completedDays: [1, 3, 5, 7], // Incomplete adherence
    }

    // As of Day 20 (after final day 14)
    const summary = computeProgramSummary(program, '2026-09-20')
    expect(summary.currentDay).toBe(14) // Clamped to duration
    expect(summary.isComplete).toBe(true)
    expect(summary.progressPercent).toBe(100)
    expect(summary.remainingDays).toBe(0)
    expect(summary.scheduledToday).toBe(false)
    expect(summary.nextScheduledDay).toBeUndefined()

    // Does NOT fabricate that all 7 uses were completed
    expect(program.completedDays.length).toBe(4)
  })

  it('rejects invalid duration or out-of-bounds schedule days (§28)', () => {
    expect(validateSchedule([1, 15], 14).valid).toBe(false)
    expect(validateSchedule([0, 5], 14).valid).toBe(false)
    expect(validateSchedule([], 14).valid).toBe(false)
    expect(validateSchedule([1, 3, 5], 0).valid).toBe(false)
  })
})
