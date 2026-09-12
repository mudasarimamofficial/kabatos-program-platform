# Row Level Security (RLS) & Adversarial Security Policy

## Non-Negotiable RLS Mandate (§63)
Row Level Security is enabled on ALL tables in the database:
- `brands`
- `program_configs`
- `customers`
- `customer_programs`
- `program_usage`
- `subscriptions`
- `access_links`
- `stripe_events`
- `customer_sessions`

## Access Policy Architecture
1. **Public / Anonymous Users:**
   - Cannot directly query or enumerate `customers`, `customer_programs`, `subscriptions`, or `program_usage`.
   - Cannot mutate any brand or program configuration.
   - Access to brand resolution and onboarding is mediated strictly through security definer RPCs (`public.resolve_brand`, `public.customer_join`).
2. **Customer Access Model:**
   - Passwordless customers authenticate via a cryptographically random capability token stored in an HttpOnly cookie.
   - Database validates the SHA-256 hash of the token against `customer_sessions` within security definer functions (`customer_dashboard`, `customer_complete_today`, `customer_undo_today`).
   - Customers can ONLY view and mutate their own program records.
3. **Master Admin Access Model:**
   - Master Admin operations require an authenticated Supabase Auth user with verified admin authorization (`app_private.is_active_admin()`).
   - Non-admin authenticated users attempting to call administrative procedures are rejected with authorization errors.

## Adversarial Test Matrix (§64)
- **Anonymous Customer Enumeration:** BLOCKED (RLS denies SELECT).
- **Anonymous Program Enumeration:** BLOCKED (RLS denies SELECT).
- **Anonymous Brand Mutation:** BLOCKED (RLS denies INSERT/UPDATE/DELETE).
- **Customer Cross-Program Read (IDOR):** BLOCKED (Capability token bound to specific `program_id`).
- **Customer Cross-Program Completion:** BLOCKED (Validation rejects scheduled day not belonging to customer's snapshot).
- **Brand Isolation:** COMPREX customer data cannot be retrieved under Demo Wellness context.
