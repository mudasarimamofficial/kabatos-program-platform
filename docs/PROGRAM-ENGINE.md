# Program Domain Engine Specification (`lib/program-engine/index.ts`)

## Overview
The Program Domain Engine is a pure TypeScript library executing authoritative business logic for product usage tracking, progress calculation, and schedule adherence.

## Functions & Mathematical Invariants (§29)

### 1. `calculateCalendarDayDifference(startDate, targetDate)` (§30)
- Computes difference using UTC calendar components: `year`, `month`, `day`.
- Eliminates Daylight Saving Time (DST) skips or timezone drift.
- Day 1 begins on `startDate`.

### 2. `getCurrentProgramDay(startDate, duration, asOfDate)`
- Formula: `clamp(rawDay, 1, duration)`.
- Prevents out-of-bounds day numbers.

### 3. `getProgressPercent(currentDay, duration)`
- Formula: `round((currentDay / duration) * 100)`.
- Bounded strictly to `[0, 100]`.

### 4. `getEstimatedRemainingDays(currentDay, duration)`
- Formula: `max(0, duration - currentDay)`.

### 5. `getNextScheduledUsage(schedule, currentDay, completedDays)` (§31)
- Identifies the earliest day in the customer's snapshot schedule that:
  - Is greater than or equal to `currentDay`.
  - Has NOT been completed.
- If today is an off-day, the UI displays "NO USAGE SCHEDULED TODAY" and points to this next scheduled usage.

### 6. `isRunningLow(currentDay, duration, threshold)` (§32)
- Returns `true` if `remainingDays <= threshold` and program is not yet completed.
- Uses calm, non-inventory wording: *"Your product may be running low."*

### 7. `normalizeSchedule(days)` and `validateSchedule(days, duration)`
- Ensures schedule contains positive integers within `[1, duration]`.

### 8. Snapshot Invariance Guarantee (§35, §90)
- Customer program snapshot captures `durationDays` and `usageSchedule` upon initial start.
- Verified in `lib/program-engine/snapshot.test.ts`: Admin changing brand duration from 14 to 10 days leaves Customer A at 14 days, while Customer B receives 10 days.

---

# Multi-Brand Architecture Specification (`docs/MULTI-BRAND.md`)

## Tenant Neutrality (§18, §70)
COMPREX is Brand #1, but the architecture is strictly tenant-neutral.
- Generic naming in schema: `brands`, `program_configs`, `customers`, `customer_programs`.
- Routing structure: `/[brandSlug]` (e.g. `/comprex`, `/demo-wellness`).
- Runtime branding injected via CSS variables: `--brand-runtime`, `--brand-hover-runtime`, `--brand-text-runtime`, `--surface-runtime`.
- No code contains `if (brandSlug === 'comprex')` for application logic.

## DEV Seed Brands (§71, §72)
1. **COMPREX:**
   - Slug: `comprex`
   - Primary: `#F07106` | Hover: `#D85800` | Text: `#121212`
   - Duration: 14 days | Schedule: `[1, 3, 5, 7, 9, 11, 13]`
2. **Demo Wellness:**
   - Slug: `demo-wellness`
   - Primary: `#246B5A` | Hover: `#1B4F43` | Text: `#FFFFFF`
   - Duration: 10 days | Schedule: `[2, 4, 6, 8, 10]`
   - Exclusively for DEV multi-tenancy verification; excluded from production seed.
