# Database Migrations Log

## Migration Philosophy (§52)
All database schema changes are managed via version-controlled SQL migration scripts under `supabase/migrations/`. No silent dashboard changes are permitted.

## Applied Migrations (1-to-1 with Supabase DEV `finbvtwjddrmbuuuyeni`)
1. `20260912095018_core_schema.sql`: Establishes core tables (`brands`, `program_configs`, `customers`, `customer_programs`, `program_usage`, `subscriptions`, `access_links`, `stripe_events`, `customer_sessions`). Configures immutability triggers on program snapshots.
2. `20260912095023_rls_and_rpc.sql`: Implements Row Level Security policies, token validation routines, and public RPCs (`resolve_brand`, `customer_join`, `customer_dashboard`, `customer_complete_today`, `customer_undo_today`).
3. `20260912095029_admin_and_stripe_rpc.sql`: Implements Master Admin RPCs (`admin_dashboard_counts`, `admin_brand_list`, `admin_create_brand`, `admin_edit_brand`, `admin_customer_roster`, `admin_customer_detail`, `admin_ensure_access_link`).
4. `20260912095033_checkout_and_reconciliation.sql`: Implements checkout reservation, status checking, and Stripe subscription reconciliation functions.
5. `20260912095039_brand_asset_storage.sql`: Sets up the `brand-assets` storage bucket and security policies restricting writes to master admin.
6. `20260912095043_tracking_activation_rpc.sql`: Implements `customer_activate_tracking` for idempotent program activation upon verified payment or trial.
7. `20260912095406_privilege_hardening.sql`: Tightens schema privileges and enforces search path protection on functions.
8. `20260912095513_public_rpc_role_cleanup.sql`: Cleans up legacy public roles and restricts sensitive procedure execution.

## Verification
Migrations are verified locally using `supabase migration list` against the remote project `finbvtwjddrmbuuuyeni`.
