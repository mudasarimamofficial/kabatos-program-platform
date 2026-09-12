# Kabatos Program Platform — Database Architecture

## Overview
The persistence layer runs on Supabase PostgreSQL with strict Row Level Security (RLS) and capability-based security definer functions.

## Core Relational Schema (§53)

### 1. `public.brands` (§54)
- `id`: UUID (PK)
- `name`: TEXT NOT NULL
- `slug`: TEXT NOT NULL UNIQUE (e.g. `comprex`, `demo-wellness`)
- `logo_path`: TEXT NULL
- `primary_color`: TEXT NOT NULL
- `primary_hover_color`: TEXT NOT NULL
- `primary_text_color`: TEXT NOT NULL
- `secondary_color`: TEXT NOT NULL
- `highlight_color`: TEXT NOT NULL
- `product_name`: TEXT NOT NULL
- `reorder_url`: TEXT NULL
- `active`: BOOLEAN DEFAULT true
- `created_at`, `updated_at`: TIMESTAMPTZ

### 2. `public.program_configs` (§55)
- `id`: UUID (PK)
- `brand_id`: UUID REFERENCES brands(id)
- `duration_days`: INTEGER NOT NULL (CHECK > 0)
- `schedule_days`: INTEGER[] NOT NULL (valid schedule check)
- `usage_title`: TEXT NOT NULL
- `usage_instructions`: TEXT DEFAULT ''
- `running_low_days`: INTEGER DEFAULT 3
- `subscription_required`: BOOLEAN DEFAULT false
- `stripe_price_id`: TEXT NULL
- `version`: INTEGER NOT NULL DEFAULT 1
- `is_current`: BOOLEAN NOT NULL DEFAULT true
- `created_at`, `updated_at`: TIMESTAMPTZ

### 3. `public.customers` (§56)
- `id`: UUID (PK)
- `brand_id`: UUID REFERENCES brands(id)
- `first_name`: TEXT NOT NULL
- `email`: TEXT NULL
- `phone`: TEXT NULL
- `order_number`: TEXT NULL
- `created_at`, `updated_at`: TIMESTAMPTZ
- *Constraint:* `email IS NOT NULL OR phone IS NOT NULL`

### 4. `public.customer_programs` (§57)
- `id`: UUID (PK)
- `customer_id`: UUID REFERENCES customers(id)
- `brand_id`: UUID REFERENCES brands(id)
- `config_id`: UUID REFERENCES program_configs(id)
- `start_date`: DATE NOT NULL DEFAULT CURRENT_DATE
- `duration_snapshot`: INTEGER NOT NULL
- `schedule_snapshot`: INTEGER[] NOT NULL
- `usage_title_snapshot`: TEXT NOT NULL
- `status`: TEXT NOT NULL CHECK (`not_started`, `active`, `completed`)
- `activated_at`: TIMESTAMPTZ NULL
- `completed_at`: TIMESTAMPTZ NULL
- `onboarding_request_id`: UUID NOT NULL UNIQUE
- *Trigger:* `customer_programs_snapshot_immutable` (strictly prevents snapshot mutations after program start)

### 5. `public.program_usage` (§58)
- `id`: UUID (PK)
- `program_id`: UUID REFERENCES customer_programs(id)
- `scheduled_day`: INTEGER NOT NULL
- `completed_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- *Unique Constraint:* `(program_id, scheduled_day)`

### 6. `public.subscriptions` (§59)
- `id`: UUID (PK)
- `customer_id`: UUID REFERENCES customers(id)
- `brand_id`: UUID REFERENCES brands(id)
- `stripe_customer_id`: TEXT NOT NULL
- `stripe_subscription_id`: TEXT NOT NULL UNIQUE
- `stripe_price_id`: TEXT NOT NULL
- `status`: TEXT NOT NULL
- `current_period_start`, `current_period_end`: TIMESTAMPTZ NULL
- `cancel_at_period_end`: BOOLEAN DEFAULT false

### 7. `public.customer_sessions` (§62, §67)
- `id`: UUID (PK)
- `program_id`: UUID REFERENCES customer_programs(id)
- `brand_id`: UUID REFERENCES brands(id)
- `token_hash`: BYTEA NOT NULL (SHA-256 hash of capability token)
- `expires_at`: TIMESTAMPTZ NOT NULL
- `revoked_at`: TIMESTAMPTZ NULL

### 8. `public.stripe_events` (§60, §84)
- `id`: TEXT PRIMARY KEY (Stripe event ID)
- `event_type`: TEXT NOT NULL
- `processing_state`: TEXT NOT NULL DEFAULT 'received'
- `processed_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- *Enforces webhook idempotency across retries.*
