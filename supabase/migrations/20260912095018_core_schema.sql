-- Kabatos core domain. This migration is forward-only and creates no seed data.
create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
-- Prevent untrusted callers from placing objects ahead of SECURITY DEFINER lookups.
revoke create on schema public from public, anon, authenticated;

create or replace function app_private.valid_slug(p_value text)
returns boolean language sql immutable set search_path = pg_catalog as $$
  select p_value ~ '^[a-z][a-z0-9-]{1,63}$'
     and p_value <> all (array['admin','api','access','auth','login','logout','dashboard',
                               'success','checkout','start','_next','favicon.ico']);
$$;

create or replace function app_private.valid_https_url(p_value text)
returns boolean language sql immutable set search_path = pg_catalog as $$
  select p_value is null or (
    length(p_value) <= 2048
    and p_value !~ '[[:cntrl:]]'
    and p_value ~ '^https://[^/@[:space:]]+'
    and p_value !~ '^https://[^/]*@'
    and p_value !~* '^https://(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|\[)'
  );
$$;

create or replace function app_private.valid_timezone(p_value text)
returns boolean language sql stable set search_path = pg_catalog as $$
  select exists (select 1 from pg_timezone_names where name = p_value);
$$;

create or replace function app_private.valid_schedule(p_duration integer, p_schedule integer[])
returns boolean language sql immutable set search_path = pg_catalog as $$
  select p_duration between 1 and 365
    and cardinality(p_schedule) between 1 and p_duration
    and p_schedule = (select array_agg(day order by day)
                      from unnest(p_schedule) as day)
    and (select count(*) = count(distinct day)
         from unnest(p_schedule) as day)
    and not exists (select 1 from unnest(p_schedule) as day
                    where day < 1 or day > p_duration);
$$;

create or replace function app_private.set_updated_at()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_path text,
  primary_color text not null,
  secondary_color text not null,
  highlight_color text not null,
  product_name text not null,
  reorder_url text,
  active boolean not null default true,
  timezone text not null default 'UTC',
  config_revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, slug),
  constraint brands_slug_valid check (app_private.valid_slug(slug)),
  constraint brands_name_length check (length(btrim(name)) between 1 and 120),
  constraint brands_logo_path_length check (logo_path is null or length(logo_path) between 1 and 1024),
  constraint brands_colors_valid check (
    primary_color ~ '^#[0-9A-Fa-f]{6}$' and secondary_color ~ '^#[0-9A-Fa-f]{6}$'
    and highlight_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint brands_product_name_length check (length(btrim(product_name)) between 1 and 120),
  constraint brands_reorder_url_valid check (app_private.valid_https_url(reorder_url)),
  constraint brands_timezone_valid check (app_private.valid_timezone(timezone)),
  constraint brands_config_revision_valid check (config_revision >= 0)
);

create table public.program_configs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  version integer not null,
  duration_days integer not null,
  schedule_days integer[] not null,
  usage_title text not null,
  usage_instructions text not null default '',
  running_low_days integer not null,
  subscription_required boolean not null default true,
  stripe_price_id text,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, version),
  unique (id, brand_id),
  constraint program_configs_version_valid check (version > 0),
  constraint program_configs_schedule_valid check (app_private.valid_schedule(duration_days, schedule_days)),
  constraint program_configs_title_length check (length(btrim(usage_title)) between 1 and 120),
  constraint program_configs_instructions_length check (length(usage_instructions) <= 2000),
  constraint program_configs_threshold_valid check (running_low_days between 0 and duration_days - 1),
  constraint program_configs_price_valid check (
    stripe_price_id is null or stripe_price_id ~ '^price_[A-Za-z0-9]{3,250}$'
  )
);
create unique index program_configs_one_current_per_brand
  on public.program_configs (brand_id) where is_current;
create index program_configs_brand_current_idx on public.program_configs (brand_id, is_current);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  first_name text not null,
  email text,
  phone text,
  order_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, brand_id),
  constraint customers_name_length check (length(btrim(first_name)) between 1 and 80),
  constraint customers_email_valid check (
    email is null or (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  ),
  constraint customers_phone_valid check (phone is null or phone ~ '^[0-9]{7,15}$'),
  constraint customers_contact_required check (email is not null or phone is not null),
  constraint customers_order_length check (order_number is null or length(order_number) between 1 and 100)
);
create index customers_brand_created_idx on public.customers (brand_id, created_at desc);
create index customers_brand_email_idx on public.customers (brand_id, lower(email)) where email is not null;
create index customers_brand_phone_idx on public.customers (brand_id, phone) where phone is not null;

create table public.customer_programs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  brand_id uuid not null,
  config_id uuid not null,
  duration_snapshot integer not null,
  schedule_snapshot integer[] not null,
  usage_title_snapshot text not null,
  usage_instructions_snapshot text not null,
  low_threshold_snapshot integer not null,
  timezone_snapshot text not null,
  subscription_required_snapshot boolean not null,
  price_id_snapshot text,
  start_date date,
  activated_at timestamptz,
  status text not null default 'not_started',
  onboarding_request_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, brand_id),
  unique (onboarding_request_id),
  foreign key (customer_id, brand_id) references public.customers(id, brand_id) on delete restrict,
  foreign key (config_id, brand_id) references public.program_configs(id, brand_id) on delete restrict,
  constraint customer_programs_schedule_valid check (app_private.valid_schedule(duration_snapshot, schedule_snapshot)),
  constraint customer_programs_title_length check (length(btrim(usage_title_snapshot)) between 1 and 120),
  constraint customer_programs_instructions_length check (length(usage_instructions_snapshot) <= 2000),
  constraint customer_programs_low_threshold_valid check (low_threshold_snapshot between 0 and duration_snapshot - 1),
  constraint customer_programs_timezone_valid check (app_private.valid_timezone(timezone_snapshot)),
  constraint customer_programs_price_valid check (
    price_id_snapshot is null or price_id_snapshot ~ '^price_[A-Za-z0-9]{3,250}$'
  ),
  constraint customer_programs_status_valid check (status in ('not_started','active','completed')),
  constraint customer_programs_activation_valid check (
    (status = 'not_started' and start_date is null and activated_at is null)
    or (status in ('active','completed') and start_date is not null and activated_at is not null)
  )
);
create index customer_programs_brand_status_idx on public.customer_programs (brand_id, status);
create index customer_programs_customer_idx on public.customer_programs (customer_id);

create table public.program_usage (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null,
  brand_id uuid not null,
  scheduled_day integer not null,
  scheduled_date date not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (program_id, scheduled_day),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict,
  constraint program_usage_day_valid check (scheduled_day > 0)
);
create index program_usage_program_day_idx on public.program_usage (program_id, scheduled_day);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null,
  brand_id uuid not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id),
  unique (stripe_subscription_id),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict,
  constraint subscriptions_customer_valid check (
    stripe_customer_id is null or stripe_customer_id ~ '^cus_[A-Za-z0-9]{3,250}$'
  ),
  constraint subscriptions_subscription_valid check (
    stripe_subscription_id is null or stripe_subscription_id ~ '^sub_[A-Za-z0-9]{3,250}$'
  ),
  constraint subscriptions_price_valid check (stripe_price_id ~ '^price_[A-Za-z0-9]{3,250}$'),
  constraint subscriptions_status_valid check (status in (
    'incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused'
  )),
  constraint subscriptions_period_valid check (
    current_period_start is null or current_period_end is null or current_period_end >= current_period_start
  )
);
create index subscriptions_brand_status_idx on public.subscriptions (brand_id, status);
create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id) where stripe_customer_id is not null;

create table public.access_links (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_links_code_valid check (code ~ '^[A-Za-z0-9_-]{16,128}$')
);
create unique index access_links_one_active_per_brand on public.access_links (brand_id) where active;
create index access_links_brand_active_idx on public.access_links (brand_id, active);

create table public.customer_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null,
  brand_id uuid not null,
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict,
  constraint customer_sessions_hash_length check (octet_length(token_hash) = 32),
  constraint customer_sessions_expiry_valid check (expires_at > created_at)
);
create index customer_sessions_hash_expiry_idx on public.customer_sessions (token_hash, expires_at);

create table public.checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null,
  brand_id uuid not null,
  request_id uuid not null unique,
  stripe_session_id text unique,
  status text not null default 'reserved',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict,
  constraint checkout_attempts_status_valid check (status in ('reserved','linked','expired','completed')),
  constraint checkout_attempts_session_valid check (
    stripe_session_id is null or stripe_session_id ~ '^cs_[A-Za-z0-9]{3,250}$'
  ),
  constraint checkout_attempts_expiry_valid check (expires_at > created_at)
);
create unique index checkout_attempts_one_open_per_program
  on public.checkout_attempts (program_id) where status in ('reserved','linked');
create index checkout_attempts_program_status_idx on public.checkout_attempts (program_id, status);

create table public.stripe_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  object_id text,
  program_id uuid not null,
  brand_id uuid not null,
  provider_created_at timestamptz,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  last_error_code text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_events_id_valid check (stripe_event_id ~ '^evt_[A-Za-z0-9]{3,250}$'),
  constraint stripe_events_type_length check (length(event_type) between 1 and 120),
  constraint stripe_events_object_id_valid check (object_id is not null and length(object_id) between 3 and 250),
  constraint stripe_events_status_valid check (status in ('pending','processed','failed','quarantined')),
  constraint stripe_events_attempts_valid check (attempt_count >= 0),
  constraint stripe_events_error_length check (last_error_code is null or length(last_error_code) <= 120),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict
);
create index stripe_events_status_created_idx on public.stripe_events (status, created_at);

create table public.subscription_reconcile_leases (
  program_id uuid primary key,
  brand_id uuid not null,
  lease_owner uuid not null,
  lease_expires_at timestamptz not null,
  fence bigint not null default 0,
  updated_at timestamptz not null default now(),
  foreign key (program_id, brand_id) references public.customer_programs(id, brand_id) on delete restrict,
  constraint subscription_reconcile_leases_fence_valid check (fence >= 0)
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function app_private.validate_program_usage()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, app_private as $$
declare
  v_program public.customer_programs%rowtype;
begin
  select * into v_program from public.customer_programs
  where id = new.program_id and brand_id = new.brand_id;
  if not found or v_program.status <> 'active'
     or new.scheduled_day <> all(v_program.schedule_snapshot)
     or new.scheduled_date <> v_program.start_date + (new.scheduled_day - 1) then
    raise exception 'invalid scheduled usage' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function app_private.prevent_config_rewrite()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'program configurations are immutable' using errcode = '55000';
  end if;
  if (to_jsonb(new) - array['is_current','updated_at'])
       is distinct from (to_jsonb(old) - array['is_current','updated_at']) then
    raise exception 'program configurations are immutable' using errcode = '55000';
  end if;
  return new;
end;
$$;

create or replace function app_private.prevent_program_snapshot_rewrite()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if (to_jsonb(new) - array['status','start_date','activated_at','updated_at'])
       is distinct from (to_jsonb(old) - array['status','start_date','activated_at','updated_at']) then
    raise exception 'program snapshots are immutable' using errcode = '55000';
  end if;
  return new;
end;
$$;

create trigger brands_set_updated_at before update on public.brands
for each row execute function app_private.set_updated_at();
create trigger program_configs_set_updated_at before update on public.program_configs
for each row execute function app_private.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
for each row execute function app_private.set_updated_at();
create trigger customer_programs_set_updated_at before update on public.customer_programs
for each row execute function app_private.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function app_private.set_updated_at();
create trigger access_links_set_updated_at before update on public.access_links
for each row execute function app_private.set_updated_at();
create trigger checkout_attempts_set_updated_at before update on public.checkout_attempts
for each row execute function app_private.set_updated_at();
create trigger stripe_events_set_updated_at before update on public.stripe_events
for each row execute function app_private.set_updated_at();
create trigger admin_profiles_set_updated_at before update on public.admin_profiles
for each row execute function app_private.set_updated_at();
create trigger program_usage_validate before insert or update on public.program_usage
for each row execute function app_private.validate_program_usage();
create trigger program_configs_immutable before update or delete on public.program_configs
for each row execute function app_private.prevent_config_rewrite();
create trigger customer_programs_snapshot_immutable before update on public.customer_programs
for each row execute function app_private.prevent_program_snapshot_rewrite();

-- Tables are protected before this migration commits; policy grants arrive next.
alter table public.brands enable row level security;
alter table public.program_configs enable row level security;
alter table public.customers enable row level security;
alter table public.customer_programs enable row level security;
alter table public.program_usage enable row level security;
alter table public.subscriptions enable row level security;
alter table public.access_links enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.checkout_attempts enable row level security;
alter table public.stripe_events enable row level security;
alter table public.subscription_reconcile_leases enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.brands force row level security;
alter table public.program_configs force row level security;
alter table public.customers force row level security;
alter table public.customer_programs force row level security;
alter table public.program_usage force row level security;
alter table public.subscriptions force row level security;
alter table public.access_links force row level security;
alter table public.customer_sessions force row level security;
alter table public.checkout_attempts force row level security;
alter table public.stripe_events force row level security;
alter table public.subscription_reconcile_leases force row level security;
alter table public.admin_profiles force row level security;
revoke all on table public.brands, public.program_configs, public.customers, public.customer_programs,
  public.program_usage, public.subscriptions, public.access_links, public.customer_sessions,
  public.checkout_attempts, public.stripe_events, public.subscription_reconcile_leases,
  public.admin_profiles from public, anon, authenticated;