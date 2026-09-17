# Stripe TEST acceptance evidence

Started 2026-09-17. Terms APPROVED. **Acceptance in progress; real checkout has not yet been certified.**

- Product: `prod_VHGrvdkYDhsdx1` (TEST).
- Price: `price_1UGiK6RCnOFy7ZssnkNPUMvs`: 499 cents USD, month, interval_count 1.
- Checkout trial: seven days; payment method collection always.
- Webhook: `we_1UGiPVRCnOFy7ZssdVtvIOvI`; API version `2026-08-26.dahlia`.
- Local and Vercel Preview TEST environment: CONFIGURED. LIVE: NOT CONFIGURED.
- Migration `20260917100000_stripe_trial_access.sql` applied to DEV `finbvtwjddrmbuuuyeni` with `supabase db push --linked --yes` after project-ref guard.
- Unit suite: 62 passed. Real Checkout, deliveries, cancellation, simulation and final deployment results pending.

Provider IDs and database evidence will be recorded after execution. No keys, capabilities or bypass URLs belong in this file.
