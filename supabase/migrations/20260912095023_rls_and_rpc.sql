-- Default-deny RLS and the only browser-facing data operations.
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
-- RLS-scoped administrator reads are intentionally ordinary authenticated queries.
grant select on public.brands, public.program_configs, public.customers, public.customer_programs,
  public.program_usage, public.subscriptions, public.access_links, public.admin_profiles to authenticated;

create or replace function app_private.is_active_admin()
returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and active
  );
$$;

create or replace function app_private.require_admin()
returns void language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
begin
  if not app_private.is_active_admin() then
    raise exception 'admin required' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function app_private.customer_context(p_brand_slug text, p_capability text)
returns table (
  session_id uuid, program_id uuid, brand_id uuid, expires_at timestamptz,
  status text, duration_days integer, schedule_days integer[], start_date date,
  timezone_name text, low_threshold integer, usage_title text, usage_instructions text,
  subscription_required boolean, price_id text
) language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare
  v_hash bytea;
begin
  if p_brand_slug is null or p_capability is null
     or p_capability !~ '^[A-Za-z0-9_-]{43}$' then
    raise exception 'invalid access' using errcode = 'P0001';
  end if;
  v_hash := digest(convert_to(p_capability, 'UTF8'), 'sha256');
  return query
    select s.id, p.id, p.brand_id, s.expires_at, p.status, p.duration_snapshot,
           p.schedule_snapshot, p.start_date, p.timezone_snapshot, p.low_threshold_snapshot,
           p.usage_title_snapshot, p.usage_instructions_snapshot,
           p.subscription_required_snapshot, p.price_id_snapshot
    from public.customer_sessions s
    join public.customer_programs p on p.id = s.program_id and p.brand_id = s.brand_id
    join public.brands b on b.id = p.brand_id
    where s.token_hash = v_hash
      and s.revoked_at is null
      and s.expires_at > now()
      and b.slug = p_brand_slug;
  if not found then
    raise exception 'invalid access' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on all functions in schema app_private from public, anon, authenticated;
-- This helper is invoked by RLS/Storage policies as the authenticated caller.
grant execute on function app_private.is_active_admin() to authenticated;

create policy brands_admin_read on public.brands for select to authenticated
  using (app_private.is_active_admin());
create policy configs_admin_read on public.program_configs for select to authenticated
  using (app_private.is_active_admin());
create policy customers_admin_read on public.customers for select to authenticated
  using (app_private.is_active_admin());
create policy programs_admin_read on public.customer_programs for select to authenticated
  using (app_private.is_active_admin());
create policy usage_admin_read on public.program_usage for select to authenticated
  using (app_private.is_active_admin());
create policy subscriptions_admin_read on public.subscriptions for select to authenticated
  using (app_private.is_active_admin());
create policy access_links_admin_read on public.access_links for select to authenticated
  using (app_private.is_active_admin());
create policy admin_profiles_self_read on public.admin_profiles for select to authenticated
  using (user_id = auth.uid());

create or replace function public.resolve_brand(p_slug text)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'slug', b.slug, 'name', b.name, 'logo_path', b.logo_path,
    'primary_color', b.primary_color, 'secondary_color', b.secondary_color,
    'highlight_color', b.highlight_color, 'product_name', b.product_name,
    'reorder_url', b.reorder_url,
    'program', jsonb_build_object(
      'duration_days', c.duration_days, 'schedule_days', c.schedule_days,
      'usage_title', c.usage_title, 'usage_instructions', c.usage_instructions,
      'running_low_days', c.running_low_days, 'subscription_required', c.subscription_required
    )
  ) into v_result
  from public.brands b
  join public.program_configs c on c.brand_id = b.id and c.is_current
  where b.slug = p_slug and b.active;
  if v_result is null then
    raise exception 'brand unavailable' using errcode = 'P0001';
  end if;
  return v_result;
end;
$$;

create or replace function public.resolve_access_link(p_code text)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public as $$
declare v_result jsonb;
begin
  select jsonb_build_object('slug', b.slug) into v_result
  from public.access_links l join public.brands b on b.id = l.brand_id
  where l.code = p_code and l.active and b.active;
  if v_result is null then
    raise exception 'link unavailable' using errcode = 'P0001';
  end if;
  return v_result;
end;
$$;

create or replace function public.customer_join(
  p_brand_slug text, p_first_name text, p_email text, p_phone text,
  p_order_number text, p_request_id uuid, p_capability text
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare
  v_brand public.brands%rowtype;
  v_config public.program_configs%rowtype;
  v_existing public.customer_programs%rowtype;
  v_program_id uuid;
  v_customer_id uuid;
  v_hash bytea;
  v_expiry timestamptz := now() + interval '7 days';
  v_email text := nullif(lower(btrim(p_email)), '');
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '');
  v_name text := btrim(coalesce(p_first_name, ''));
  v_order text := nullif(btrim(p_order_number), '');
begin
  if p_request_id is null or p_capability is null
     or p_capability !~ '^[A-Za-z0-9_-]{43}$'
     or length(v_name) not between 1 and 80
     or (v_email is null and v_phone is null)
     or (v_email is not null and (length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
     or (v_phone is not null and v_phone !~ '^[0-9]{7,15}$')
     or (v_order is not null and length(v_order) > 100) then
    raise exception 'invalid onboarding input' using errcode = 'P0001';
  end if;
  v_hash := digest(convert_to(p_capability, 'UTF8'), 'sha256');

  select * into v_existing from public.customer_programs
  where onboarding_request_id = p_request_id;
  if found then
    if exists (
      select 1 from public.customer_sessions s
      where s.program_id = v_existing.id and s.brand_id = v_existing.brand_id
        and s.token_hash = v_hash and s.revoked_at is null and s.expires_at > now()
    ) then
      return jsonb_build_object('status', v_existing.status, 'expires_at', (
        select s.expires_at from public.customer_sessions s
        where s.program_id = v_existing.id and s.token_hash = v_hash
        order by s.created_at desc limit 1
      ));
    end if;
    raise exception 'invalid access' using errcode = 'P0001';
  end if;

  select * into v_brand from public.brands
  where slug = p_brand_slug and active for update;
  if not found then
    raise exception 'brand unavailable' using errcode = 'P0001';
  end if;
  select * into v_config from public.program_configs
  where brand_id = v_brand.id and is_current for update;
  if not found then
    raise exception 'brand unavailable' using errcode = 'P0001';
  end if;
  if v_config.subscription_required and v_config.stripe_price_id is null then
    -- Keep incomplete paid configurations publishable, but never strand a new customer
    -- in a program that cannot be checked out or honestly activated.
    raise exception 'activation unavailable' using errcode = 'P0001';
  end if;

  insert into public.customers (brand_id, first_name, email, phone, order_number)
  values (v_brand.id, v_name, v_email, v_phone, v_order) returning id into v_customer_id;
  insert into public.customer_programs (
    customer_id, brand_id, config_id, duration_snapshot, schedule_snapshot,
    usage_title_snapshot, usage_instructions_snapshot, low_threshold_snapshot,
    timezone_snapshot, subscription_required_snapshot, price_id_snapshot, onboarding_request_id
  ) values (
    v_customer_id, v_brand.id, v_config.id, v_config.duration_days, v_config.schedule_days,
    v_config.usage_title, v_config.usage_instructions, v_config.running_low_days,
    v_brand.timezone, v_config.subscription_required, v_config.stripe_price_id, p_request_id
  ) returning id into v_program_id;
  insert into public.customer_sessions (program_id, brand_id, token_hash, expires_at)
  values (v_program_id, v_brand.id, v_hash, v_expiry);
  return jsonb_build_object('status', 'not_started', 'expires_at', v_expiry);
exception when unique_violation then
  -- A concurrent retry may have won the request ID. It is only returned to its capability.
  select * into v_existing from public.customer_programs where onboarding_request_id = p_request_id;
  if found and exists (
    select 1 from public.customer_sessions s
    where s.program_id = v_existing.id and s.token_hash = v_hash
      and s.revoked_at is null and s.expires_at > now()
  ) then
    return jsonb_build_object('status', v_existing.status, 'expires_at', (
      select s.expires_at from public.customer_sessions s where s.program_id = v_existing.id
      and s.token_hash = v_hash order by s.created_at desc limit 1
    ));
  end if;
  raise exception 'invalid access' using errcode = 'P0001';
end;
$$;

create or replace function public.customer_dashboard(p_brand_slug text, p_capability text)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare
  v record;
  v_brand public.brands%rowtype;
  v_today date;
  v_raw_day integer;
  v_display_day integer;
  v_effective_status text;
  v_completed_at timestamptz;
  v_next_day integer;
  v_subscription_status text;
begin
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  select * into v_brand from public.brands where id = v.brand_id;
  if v.status = 'not_started' then
    v_raw_day := null; v_display_day := null; v_effective_status := 'not_started';
  else
    v_today := (now() at time zone v.timezone_name)::date;
    v_raw_day := v_today - v.start_date + 1;
    v_display_day := greatest(1, least(v.duration_days, v_raw_day));
    v_effective_status := case when v_raw_day > v.duration_days then 'completed' else v.status end;
    if v_raw_day between 1 and v.duration_days then
      select completed_at into v_completed_at from public.program_usage
      where program_id = v.program_id and scheduled_day = v_raw_day;
    end if;
    select d into v_next_day from unnest(v.schedule_days) d
    where d >= greatest(v_raw_day, 1)
      and not exists (select 1 from public.program_usage u where u.program_id = v.program_id and u.scheduled_day = d)
    order by d limit 1;
  end if;
  select status into v_subscription_status from public.subscriptions where program_id = v.program_id;
  return jsonb_build_object(
    'brand', jsonb_build_object(
      'slug', v_brand.slug, 'name', v_brand.name, 'logo_path', v_brand.logo_path,
      'primary_color', v_brand.primary_color, 'secondary_color', v_brand.secondary_color,
      'highlight_color', v_brand.highlight_color, 'product_name', v_brand.product_name,
      'reorder_url', v_brand.reorder_url, 'active', v_brand.active
    ),
    'program', jsonb_build_object(
      'status', v_effective_status, 'duration_days', v.duration_days, 'schedule_days', v.schedule_days,
      'usage_title', v.usage_title, 'usage_instructions', v.usage_instructions,
      'running_low_days', v.low_threshold, 'start_date', v.start_date,
      'current_day', v_display_day, 'raw_day', v_raw_day,
      'progress_percent', case when v_display_day is null then 0 else round(v_display_day::numeric / v.duration_days * 100) end,
      'estimated_days_remaining', case when v_display_day is null then null else greatest(v.duration_days - v_display_day, 0) end,
      'next_scheduled_day', v_next_day
    ),
    'usage', jsonb_build_object('scheduled_day', v_raw_day, 'completed_at', v_completed_at),
    'subscription', jsonb_build_object('status', v_subscription_status)
  );
end;
$$;

create or replace function public.customer_complete_today(p_brand_slug text, p_capability text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record; v_today date; v_day integer;
declare v_completed timestamptz; v_inserted boolean := false;
begin
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  if v.status <> 'active' then raise exception 'invalid access' using errcode = 'P0001'; end if;
  v_today := (now() at time zone v.timezone_name)::date;
  v_day := v_today - v.start_date + 1;
  if v_day not between 1 and v.duration_days or v_day <> all(v.schedule_days) then
    raise exception 'usage is not scheduled today' using errcode = 'P0001';
  end if;
  insert into public.program_usage (program_id, brand_id, scheduled_day, scheduled_date)
  values (v.program_id, v.brand_id, v_day, v_today)
  on conflict (program_id, scheduled_day) do nothing returning completed_at into v_completed;
  if found then v_inserted := true; else
    select completed_at into v_completed from public.program_usage where program_id = v.program_id and scheduled_day = v_day;
  end if;
  return jsonb_build_object('scheduled_day', v_day, 'scheduled_date', v_today,
    'completed_at', v_completed, 'already_completed', not v_inserted);
end;
$$;

create or replace function public.customer_undo_today(p_brand_slug text, p_capability text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record; v_today date; v_day integer; v_deleted boolean;
begin
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  if v.status <> 'active' then raise exception 'invalid access' using errcode = 'P0001'; end if;
  v_today := (now() at time zone v.timezone_name)::date;
  v_day := v_today - v.start_date + 1;
  if v_day not between 1 and v.duration_days or v_day <> all(v.schedule_days) then
    raise exception 'usage is not scheduled today' using errcode = 'P0001';
  end if;
  delete from public.program_usage where program_id = v.program_id and scheduled_day = v_day
    and scheduled_date = v_today;
  v_deleted := found;
  return jsonb_build_object('scheduled_day', v_day, 'undone', v_deleted);
end;
$$;

-- Secure the functions in the same migration that creates them; later migrations repeat
-- these revocations defensively when adding the complete contract.
revoke all on function public.resolve_brand(text) from public;
revoke all on function public.resolve_access_link(text) from public;
revoke all on function public.customer_join(text,text,text,text,text,uuid,text) from public;
revoke all on function public.customer_dashboard(text,text) from public;
revoke all on function public.customer_complete_today(text,text) from public;
revoke all on function public.customer_undo_today(text,text) from public;
grant execute on function public.resolve_brand(text), public.resolve_access_link(text),
  public.customer_join(text,text,text,text,text,uuid,text), public.customer_dashboard(text,text),
  public.customer_complete_today(text,text), public.customer_undo_today(text,text)
to anon, authenticated;