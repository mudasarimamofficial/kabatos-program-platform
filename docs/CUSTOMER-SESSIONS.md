# Customer Sessions Service Specification

## Implementation Details (`lib/auth/customer-session.ts`)
The customer session lifecycle operates as follows:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Browser
    participant Server as Next.js Server
    participant DB as Supabase DEV

    Customer->>Browser: Enters First Name & Email/Phone
    Browser->>Server: POST onboarding request
    Server->>Server: Generate 43-char capability token
    Server->>DB: rpc('customer_join', token_hash, request_id)
    DB-->>Server: Customer & Program Created
    Server->>Browser: Set-Cookie: kabatos_customer_session (HttpOnly)
    Browser->>Server: GET /[brandSlug]/dashboard (with cookie)
    Server->>DB: rpc('customer_dashboard', token_hash)
    DB-->>Server: Return Snapshot & Progress Data
    Server-->>Customer: Render Branded Dashboard
```

## Security Guarantees
1. **Cookie Flagging:** `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (production).
2. **No LocalStorage Auth:** Zero client-side script access to authentication tokens prevents XSS token theft.
3. **Idempotent Onboarding:** Protected by `onboarding_request_id` preventing accidental duplicate customer creation upon double-click.
