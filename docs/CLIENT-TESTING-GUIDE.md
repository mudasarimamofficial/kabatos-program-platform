# Kabatos / COMPREX — Client Acceptance Testing Guide

Welcome to the Kabatos Program Platform / COMPREX test environment. This guide walks you through verifying the complete customer journey, subscription activation, tracking dashboard, and cancellation flow.

---

## 1. Test Environment Overview

- **Authoritative Preview URL**: [https://kabatos-stripe-test.vercel.app](https://kabatos-stripe-test.vercel.app)
- **Stripe Mode**: **TEST MODE ONLY** (No real credit cards, no real charges, $0.00 actual billing).
- **Backend**: Supabase Development Database (`finbvtwjddrmbuuuyeni`).
- **Commercial Terms Configured**:
  - **Plan**: Kabatos / COMPREX Tracking Service
  - **Price**: $4.99 USD per month
  - **Free Trial**: 7 Days
  - **Access**: Immediate upon checkout completion
  - **Renewal**: Automatic monthly renewal after the 7-day trial unless canceled
  - **Cancellation**: Customers can cancel anytime; tracking access remains active through the end of the trial or paid billing period.

---

## 2. Test Payment Information (TEST MODE ONLY)

When prompted on the Stripe Checkout page, use Stripe's official test card details:

> [!NOTE]
> **TEST MODE ONLY — DO NOT USE REAL CREDIT CARDS**
> - **Card Number**: `4242 • 4242 • 4242 • 4242`
> - **Expiration Date**: Any valid future date (e.g., `12/32`)
> - **CVC**: Any 3 digits (e.g., `123`)
> - **Billing Name & Zip**: Any name and postal code (e.g., `John Doe`, `10001`)

---

## 3. Step-by-Step Customer Journey Testing Sequence

### Step 1: Open the COMPREX Landing Page
1. In your web browser, navigate to:  
   [https://kabatos-stripe-test.vercel.app/comprex](https://kabatos-stripe-test.vercel.app/comprex)
2. Verify the branded COMPREX landing screen displays with official orange branding (`#F07106`), product pouch image, program overview (14-day schedule), and the **Start my program** button.

### Step 2: Begin Onboarding
1. Click **Start my program** to go to `/comprex/start`.
2. Notice the customer details form requesting:
   - First Name
   - Email or Phone
   - Order Number (Optional)

### Step 3: Enter Test Customer Data
1. Enter your test details (e.g., First Name: `Test Tester`, Contact: `test@example.com`).
2. Click **Continue**.
3. You will be redirected to `/comprex/activate`.

### Step 4: Review Program Activation Terms
1. On the activation screen, verify:
   - Program details: COMPREX 14-day duration, 7 scheduled uses.
   - Subscription copy: **7-day free trial. Then $4.99/month, renewing automatically each month unless you cancel. Cancel anytime; access remains through your trial or paid period. Tracking/service subscription only. Physical product sold separately.**
2. Click **Activate my program** to initiate checkout.

### Step 5: Complete Stripe TEST Checkout
1. You will be redirected to the secure Stripe Checkout page hosted by Stripe.
2. Confirm the line item shows:
   - Product: **Kabatos / COMPREX Tracking Service**
   - Price: **$4.99 per month**
   - Trial: **7 days free** (Total due today: **$0.00**)
3. Enter the test card details (`4242 4242 4242 4242`).
4. Click **Start trial**.

### Step 6: Verify Success Confirmation
1. Upon completing checkout, Stripe redirects you back to:  
   `https://kabatos-stripe-test.vercel.app/comprex/success`
2. You will see the confirmation screen stating:
   - **Subscription active**
   - **7-day free trial started**
3. Click **Go to my tracking dashboard**.

### Step 7: View the Tracking Dashboard
1. You will arrive at `/comprex/dashboard`.
2. Verify:
   - Welcome greeting with your name.
   - Active program progress indicator (Day 1 of 14).
   - Scheduled use timeline.
   - **Subscription Status Card**: Displays **Trialing (7-day free trial)** and current expiration date.

### Step 8: Mark Usage & Track Progress
1. Click the button to mark today's usage as complete.
2. Verify the progress indicator updates immediately and records today's date in your usage log.
3. Test the **Undo** action to verify you can revert accidental completions.

### Step 9: Test Subscription Cancellation
1. In the **Subscription** card on your dashboard, click **Cancel subscription**.
2. A confirmation modal will appear explaining:
   - **Your tracking access will remain active until the end of your 7-day trial period.**
   - You will not be charged when the trial ends.
3. Confirm the cancellation.
4. Verify the dashboard updates to show:
   - Status: **Cancellation scheduled**
   - Effective End Date: Matches your 7-day trial expiration date.
   - **Tracking access remains fully functional.**

---

## 4. Multi-Brand Isolation Check (Optional)

1. Open [https://kabatos-stripe-test.vercel.app/demo-wellness](https://kabatos-stripe-test.vercel.app/demo-wellness).
2. Verify that Demo Wellness displays its distinct green palette (`#246B5A`), 10-day duration, and different schedule.
3. Confirm that your COMPREX customer session does not leak into or grant access to the Demo Wellness dashboard.

---

## 5. Master Admin Portal Review (Optional)

If you have been provided with Master Admin credentials:
1. Navigate to: [https://kabatos-stripe-test.vercel.app/admin/login](https://kabatos-stripe-test.vercel.app/admin/login)
2. Log in with your admin email and password.
3. Review:
   - **Overview Dashboard**: Metrics for Total Brands, Total Customers, Active Programs, and Subscriptions.
   - **Brands Roster**: View COMPREX and Demo Wellness.
   - **Brand Editor**: View and update brand configuration settings.
   - **Customers Roster**: View registered test customers.
   - **QR & Access Links**: Generate and download authentic PNG or vector SVG QR codes for physical product packaging.

---

## 6. What's Next: Production Launch & Transfer

Once you complete acceptance testing and approve the platform:
1. Provide your GitHub, Supabase, Vercel, and Stripe organization details as outlined in [`CLIENT-ACCOUNT-ACCESS-REQUEST.md`](file:///D:/COMPREX%20DEVELOPMENT/comprex-main/comprex-main/docs/CLIENT-ACCOUNT-ACCESS-REQUEST.md).
2. We will execute the [`FINAL-OWNERSHIP-TRANSFER-RUNBOOK.md`](file:///D:/COMPREX%20DEVELOPMENT/comprex-main/comprex-main/docs/FINAL-OWNERSHIP-TRANSFER-RUNBOOK.md) to transfer complete project ownership to your accounts.
3. We will configure your commercial domain (e.g., `program.goodcomprex.com`) and switch Stripe to LIVE mode for real customer transactions.
