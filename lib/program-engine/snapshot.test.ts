import { describe, it, expect } from 'vitest'
import { computeProgramSummary, type ProgramSnapshot, type CustomerProgramState } from './index'

interface MutableBrandProgramConfig {
  brandId: string
  durationDays: number
  usageSchedule: number[]
  version: number
}

class ProgramService {
  private brandConfigs: Map<string, MutableBrandProgramConfig> = new Map()
  private customerPrograms: Map<string, CustomerProgramState> = new Map()

  setBrandConfig(brandId: string, durationDays: number, usageSchedule: number[]) {
    const existing = this.brandConfigs.get(brandId)
    const version = existing ? existing.version + 1 : 1
    this.brandConfigs.set(brandId, { brandId, durationDays, usageSchedule, version })
  }

  startCustomerProgram(customerId: string, brandId: string, startDate: string): CustomerProgramState {
    const brandConfig = this.brandConfigs.get(brandId)
    if (!brandConfig) throw new Error(`Brand ${brandId} not found`)

    // SNAPSHOT CREATION (Immutable deep copy of config at activation time)
    const snapshot: ProgramSnapshot = {
      durationDays: brandConfig.durationDays,
      usageSchedule: [...brandConfig.usageSchedule],
    }

    const program: CustomerProgramState = {
      startDate,
      snapshot,
      completedDays: [],
      status: 'active',
    }

    this.customerPrograms.set(customerId, program)
    return program
  }

  getCustomerProgram(customerId: string): CustomerProgramState | undefined {
    return this.customerPrograms.get(customerId)
  }
}

describe('Program Configuration Snapshot Invariance (§35, §90)', () => {
  it('preserves started customer snapshot when admin mutates brand configuration', () => {
    const service = new ProgramService()
    const BRAND_ID = 'brand-comprex'

    // Step 1: Admin establishes Brand configuration with 14-day duration and odd-day schedule
    service.setBrandConfig(BRAND_ID, 14, [1, 3, 5, 7, 9, 11, 13])

    // Step 2: Customer A starts their program
    const customerAProgram = service.startCustomerProgram('customer-a', BRAND_ID, '2026-09-01')
    expect(customerAProgram.snapshot.durationDays).toBe(14)
    expect(customerAProgram.snapshot.usageSchedule).toEqual([1, 3, 5, 7, 9, 11, 13])

    // Step 3: Admin changes active brand configuration to 10-day duration and even-day schedule
    service.setBrandConfig(BRAND_ID, 10, [2, 4, 6, 8, 10])

    // Step 4: Verify Customer A remains strictly 14 days and original schedule
    const customerAAfterMutation = service.getCustomerProgram('customer-a')!
    expect(customerAAfterMutation.snapshot.durationDays).toBe(14)
    expect(customerAAfterMutation.snapshot.usageSchedule).toEqual([1, 3, 5, 7, 9, 11, 13])

    // Step 5: Customer B starts after the admin change and receives the new 10-day snapshot
    const customerBProgram = service.startCustomerProgram('customer-b', BRAND_ID, '2026-09-05')
    expect(customerBProgram.snapshot.durationDays).toBe(10)
    expect(customerBProgram.snapshot.usageSchedule).toEqual([2, 4, 6, 8, 10])

    // Step 6: Verify Customer A and Customer B have independent, non-interfering snapshots
    expect(customerAAfterMutation.snapshot.durationDays).toBe(14)
    expect(customerBProgram.snapshot.durationDays).toBe(10)

    // Step 7: Verify domain engine calculations reflect each customer's respective snapshot
    const summaryA = computeProgramSummary(customerAAfterMutation, '2026-09-07') // Day 7 of 14
    expect(summaryA.currentDay).toBe(7)
    expect(summaryA.remainingDays).toBe(7)
    expect(summaryA.scheduledToday).toBe(true)
    expect(summaryA.progressPercent).toBe(50) // 7/14 = 50%

    const summaryB = computeProgramSummary(customerBProgram, '2026-09-07') // Day 3 of 10
    expect(summaryB.currentDay).toBe(3)
    expect(summaryB.remainingDays).toBe(7)
    expect(summaryB.scheduledToday).toBe(false) // 3 is not in [2,4,6,8,10]
    expect(summaryB.progressPercent).toBe(30) // 3/10 = 30%
  })
})
