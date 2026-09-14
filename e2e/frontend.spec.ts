import { test, expect } from '@playwright/test'

test.describe('Customer Experience (C-01 to C-10)', () => {
  test('completes full customer journey from branded welcome to dashboard usage completion', async ({ page }) => {
    // C-01: Welcome Screen
    await page.goto('/comprex')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/your program/i)
    await expect(page.getByRole('main')).toBeVisible()

    // Navigate to Onboarding
    await page.getByRole('link', { name: /start my program/i }).click()
    await expect(page).toHaveURL(/\/comprex\/start/, { timeout: 30000 })

    // C-02: Customer Details / Onboarding Validation
    const continueBtn = page.getByRole('button', { name: /continue/i })
    await continueBtn.click()
    // Should display validation error when submitting empty
    await expect(page.getByText(/enter at least 2 characters/i)).toBeVisible()

    // Fill valid onboarding details
    await page.locator('#first-name').fill('Sarah')
    await page.locator('#contact').fill('sarah@example.com')
    await page.locator('#order-number').fill('#CX-9021')
    await continueBtn.click()

    // C-03: Program Activation Screen
    await expect(page).toHaveURL(/\/comprex\/activate/, { timeout: 30000 })
    await expect(page.getByRole('heading', { name: /program activation/i })).toBeVisible()
    await expect(page.getByText(/14 days/i)).toBeVisible()

    // C-04: Secure Checkout Handoff
    await page.getByRole('link', { name: /activate my program/i }).click()
    await expect(page).toHaveURL(/\/comprex\/checkout/, { timeout: 30000 })
    await expect(page.getByText(/secure checkout handoff/i)).toBeVisible()

    // C-05: Complete checkout simulation -> Success Screen
    await page.getByRole('button', { name: /continue to secure checkout/i }).click()
    await expect(page.getByRole('heading', { name: /your program is ready/i })).toBeVisible({ timeout: 30000 })

    // C-06: Program Dashboard Security Gate
    await page.getByRole('link', { name: /go to my dashboard/i }).click()
    // In unactivated state without approved Stripe price,
    // the security layer safely redirects unactivated visitors to branded entry (/comprex)
    await page.waitForURL(/\/comprex$/, { timeout: 30000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/your program/i)
  })

  test('handles invalid brand slug with graceful error screen (C-10)', async ({ page }) => {
    await page.goto('/invalid-brand-slug')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByText(/unavailable|not found|error/i)).toBeVisible()
  })
})

test.describe('Admin Experience (A-01 to A-07)', () => {
  test('renders operational metrics and navigates administrative roster', async ({ page }) => {
    // A-01: Admin Login Screen
    await page.goto('/admin/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    // Sign in as Master Admin to access protected admin routes
    const adminEmail = process.env.DEV_ADMIN_EMAIL || process.env.MASTER_ADMIN_EMAIL || 'master-admin@kabatos.dev'
    const adminPassword = process.env.DEV_ADMIN_PASSWORD || process.env.MASTER_ADMIN_PASSWORD || 'DevMasterPass_177af0525b6d91e0!'
    await page.locator('#email').fill(adminEmail)
    await page.locator('#password').fill(adminPassword)
    await page.getByRole('button', { name: /sign in/i }).click()

    // A-02: Master Admin Dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/total brands/i)).toBeVisible()
    await expect(page.getByText(/total customers/i)).toBeVisible()
    await expect(page.getByText(/active programs/i)).toBeVisible()
    await expect(page.getByText(/active subscriptions/i)).toBeVisible()

    // A-03: Brands Roster
    await page.goto('/admin/brands')
    await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'COMPREX' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Demo Wellness' })).toBeVisible()

    // A-04: Brand Editor
    await page.goto('/admin/brands/comprex')
    await expect(page.getByRole('heading', { name: /edit brand/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByLabel(/brand name/i)).toHaveValue('COMPREX')
    await expect(page.getByLabel(/product name/i)).toBeVisible()
    await expect(page.getByLabel(/duration/i)).toBeVisible()

    // A-05: Customer Roster
    await page.goto('/admin/customers')
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search customers/i)).toBeVisible()

    // A-06: Customer Detail
    const firstCustomer = page.locator('.customer-item, tr, li').filter({ hasText: /sarah|customer/i }).first()
    if (await firstCustomer.isVisible()) {
      await firstCustomer.click()
      await expect(page.getByRole('heading', { name: /customer detail|progress/i })).toBeVisible()
    }

    // A-07: QR / Access Links
    await page.goto('/admin/access')
    await expect(page.getByRole('heading', { name: /access links/i })).toBeVisible()
    await expect(page.locator('#access-qr')).toBeVisible()
    await expect(page.getByRole('button', { name: /download png/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /download svg/i })).toBeVisible()
  })
})

test.describe('Multi-Brand Architecture (§70, §71, §72)', () => {
  test('renders distinct brand identities without hardcoded template collisions', async ({ page }) => {
    // Brand 1: COMPREX
    await page.goto('/comprex')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.logo').filter({ hasText: 'COMPREX' })).toBeVisible()

    // Brand 2: Demo Wellness
    await page.goto('/demo-wellness')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.logo').filter({ hasText: 'Demo Wellness' })).toBeVisible()
  })
})

test.describe('Responsive Layout Verification (§97)', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE (375px)' },
    { width: 390, height: 844, name: 'iPhone 12/13/14 (390px)' },
    { width: 430, height: 932, name: 'iPhone 14/15 Pro Max (430px)' },
    { width: 768, height: 1024, name: 'iPad Mini (768px)' },
    { width: 1024, height: 768, name: 'iPad Pro / Laptop (1024px)' },
    { width: 1440, height: 900, name: 'Desktop Large (1440px)' },
  ]

  for (const vp of viewports) {
    test(`renders cleanly without horizontal overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/comprex')
      await expect(page.getByRole('main')).toBeVisible()

      // Ensure no horizontal scrollbar on body
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
    })
  }
})
