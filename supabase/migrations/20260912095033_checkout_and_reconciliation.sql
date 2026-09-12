-- Checkout reservation is capability-scoped; Stripe linkage/reconciliation is service-role only.
create or replace function public.customer_checkout_reserve(
  p_brand_slug text, p_capability text, p_request_id uuid
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record; v_existing public.checkout_attempts%rowtype; v_attempt_id uuid;
declare v_expiry timestamptz := now() + interval '30 minutes';
begin
  if p_request_id is null then raise exception 'checkout unavailable' using errcode = 'P0001'; end if;
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  -- Serialize all checkout attempts for this program and retire only expired opens.
  perform 1 from public.customer_programs where id = v.program_id for update;
  if v.status <> 'not_started' or not v.subscription_required or v.price_id is null then
    raise exception 'checkout unavailable' using errcode = 'P0001';
  end if;
  update public.checkout_attempts
     set status = 'expired'
   where program_id = v.program_id and status in ('reserved','linked') and expires_at <= now();
  select * into v_existing from public.checkout_attempts
   where request_id = p_request_id;
  if found then
    if v_existing.program_id <> v.program_id or v_existing.brand_id <> v.brand_id then
      raise exception 'invalid access' using errcode = 'P0001';
    end if;
    return jsonb_build_object('attempt_id', v_existing.id, 'status', v_existing.status,
      'expires_at', v_existing.expires_at, 'stripe_price_id', v.price_id);
  end if;
  select * into v_existing from public.checkout_attempts
   where program_id = v.program_id and status in ('reserved','linked') and expires_at > now()
   order by created_at desc limit 1;
  if found then
    return jsonb_build_object('attempt_id', v_existing.id, 'status', v_existing.status,
      'expires_at', v_existing.expires_at, 'stripe_price_id', v.price_id);
  end if;
  insert into public.checkout_attempts (program_id, brand_id, request_id, expires_at)
  values (v.program_id, v.brand_id, p_request_id, v_expiry) returning id into v_attempt_id;
  return jsonb_build_object('attempt_id', v_attempt_id, 'status', 'reserved',
    'expires_at', v_expiry, 'stripe_price_id', v.price_id);
end;
$$;

create or replace function public.customer_checkout_status(
  p_brand_slug text, p_capability text, p_attempt_id uuid
) returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record; v_attempt public.checkout_attempts%rowtype;
begin
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  select * into v_attempt from public.checkout_attempts
  where id = p_attempt_id and program_id = v.program_id and brand_id = v.brand_id;
  if not found then raise exception 'invalid access' using errcode = 'P0001'; end if;
  return jsonb_build_object('status', v_attempt.status, 'expires_at', v_attempt.expires_at);
end;
$$;

create or replace function app_private.require_service_role()
returns void language plpgsql stable security definer
set search_path = pg_catalog, app_private as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'trusted executor required' using errcode = 'P0001';
  end if;
end;
$$;
revoke all on function app_private.require_service_role() from public, anon, authenticated;

create or replace function public.stripe_link_checkout_attempt(
  p_attempt_id uuid, p_stripe_session_id text, p_expires_at timestamptz
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_attempt public.checkout_attempts%rowtype;
begin
  perform app_private.require_service_role();
  if p_stripe_session_id is null or p_stripe_session_id !~ '^cs_[A-Za-z0-9]{3,250}$'
     or p_expires_at is null or p_expires_at <= now() then
    raise exception 'invalid checkout linkage' using errcode = 'P0001';
  end if;
  select * into v_attempt from public.checkout_attempts where id = p_attempt_id for update;
  if not found or v_attempt.status not in ('reserved','linked') or v_attempt.expires_at <= now() then
    raise exception 'checkout attempt unavailable' using errcode = 'P0001';
  end if;
  if v_attempt.stripe_session_id is not null and v_attempt.stripe_session_id <> p_stripe_session_id then
    raise exception 'checkout linkage conflict' using errcode = 'P0001';
  end if;
  update public.checkout_attempts set stripe_session_id = p_stripe_session_id,
    status = 'linked', expires_at = least(v_attempt.expires_at, p_expires_at)
  where id = p_attempt_id;
  return jsonb_build_object('attempt_id', p_attempt_id, 'status', 'linked');
end;
$$;

create or replace function public.stripe_resolve_checkout_attempt(
  p_attempt_id uuid, p_stripe_session_id text
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record;
begin
  perform app_private.require_service_role();
  select a.id, a.program_id, a.brand_id, a.stripe_session_id, a.status,
         p.price_id_snapshot
    into v
    from public.checkout_attempts a
    join public.customer_programs p on p.id = a.program_id and p.brand_id = a.brand_id
   where a.id = p_attempt_id
   for update;
  if not found or v.stripe_session_id is distinct from p_stripe_session_id then
    raise exception 'checkout ownership unavailable' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'attempt_id', v.id,
    'program_id', v.program_id,
    'brand_id', v.brand_id,
    'stripe_session_id', v.stripe_session_id,
    'status', v.status,
    'stripe_price_id', v.price_id_snapshot
  );
end;
$$;

create or replace function public.stripe_resolve_subscription(
  p_stripe_subscription_id text
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record;
begin
  perform app_private.require_service_role();
  select s.program_id, s.brand_id, s.stripe_subscription_id, s.stripe_customer_id,
         s.stripe_price_id, s.status, p.price_id_snapshot
    into v
    from public.subscriptions s
    join public.customer_programs p on p.id = s.program_id and p.brand_id = s.brand_id
   where s.stripe_subscription_id = p_stripe_subscription_id
   for update;
  if not found then
    raise exception 'subscription ownership unavailable' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'program_id', v.program_id,
    'brand_id', v.brand_id,
    'stripe_subscription_id', v.stripe_subscription_id,
    'stripe_customer_id', v.stripe_customer_id,
    'stripe_price_id', v.stripe_price_id,
    'snapshot_price_id', v.price_id_snapshot,
    'status', v.status
  );
end;
$$;

create or replace function public.stripe_register_event(
  p_event_id text, p_event_type text, p_livemode boolean, p_object_id text,
  p_program_id uuid, p_brand_id uuid, p_provider_created_at timestamptz
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_event public.stripe_events%rowtype;
begin
  perform app_private.require_service_role();
  if p_livemode then raise exception 'live Stripe events are not accepted' using errcode = 'P0001'; end if;
  if p_object_id is null or p_program_id is null or p_brand_id is null then
    raise exception 'invalid Stripe event binding' using errcode = 'P0001';
  end if;
  -- Lock program before event everywhere that both resources are used.
  perform 1 from public.customer_programs
    where id = p_program_id and brand_id = p_brand_id for update;
  if not found then raise exception 'invalid Stripe event binding' using errcode = 'P0001'; end if;
  insert into public.stripe_events (
    stripe_event_id, event_type, livemode, object_id, program_id, brand_id, provider_created_at
  ) values (p_event_id, p_event_type, p_livemode, p_object_id, p_program_id, p_brand_id, p_provider_created_at)
  on conflict (stripe_event_id) do nothing;
  select * into v_event from public.stripe_events where stripe_event_id = p_event_id for update;
  if v_event.event_type is distinct from p_event_type
     or v_event.livemode is distinct from p_livemode
     or v_event.object_id is distinct from p_object_id
     or v_event.program_id is distinct from p_program_id
     or v_event.brand_id is distinct from p_brand_id
     or v_event.provider_created_at is distinct from p_provider_created_at then
    raise exception 'conflicting Stripe event registration' using errcode = 'P0001';
  end if;
  return jsonb_build_object('status', v_event.status);
end;
$$;

create or replace function public.stripe_mark_event_outcome(
  p_event_id text, p_outcome text, p_error_code text default null
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_status text;
begin
  perform app_private.require_service_role();
  if p_outcome is null or p_outcome not in ('failed','quarantined')
     or p_error_code is null or length(p_error_code) > 120 then
    raise exception 'invalid Stripe event outcome' using errcode = 'P0001';
  end if;
  update public.stripe_events
  set status = p_outcome, attempt_count = attempt_count + 1, last_error_code = p_error_code
  where stripe_event_id = p_event_id
  returning status into v_status;
  if v_status is null then raise exception 'unregistered Stripe event' using errcode = 'P0001'; end if;
  return jsonb_build_object('status', v_status);
end;
$$;

create or replace function public.stripe_claim_reconcile(
  p_program_id uuid, p_brand_id uuid, p_lease_owner uuid
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_fence bigint; v_expiry timestamptz := clock_timestamp() + interval '2 minutes';
declare v_lease public.subscription_reconcile_leases%rowtype;
begin
  perform app_private.require_service_role();
  if p_lease_owner is null then raise exception 'invalid reconciliation target' using errcode = 'P0001'; end if;
  perform 1 from public.customer_programs
    where id = p_program_id and brand_id = p_brand_id for update;
  if not found then raise exception 'invalid reconciliation target' using errcode = 'P0001'; end if;
  select * into v_lease from public.subscription_reconcile_leases
    where program_id = p_program_id for update;
  if found then
    if v_lease.brand_id <> p_brand_id
       or (v_lease.lease_expires_at > clock_timestamp() and v_lease.lease_owner <> p_lease_owner) then
      raise exception 'reconciliation busy' using errcode = 'P0001';
    end if;
    update public.subscription_reconcile_leases set lease_owner = p_lease_owner,
      lease_expires_at = v_expiry, fence = v_lease.fence + 1
    where program_id = p_program_id returning fence into v_fence;
  else
    insert into public.subscription_reconcile_leases (
      program_id, brand_id, lease_owner, lease_expires_at, fence
    ) values (p_program_id, p_brand_id, p_lease_owner, v_expiry, 1)
    returning fence into v_fence;
  end if;
  return jsonb_build_object('fence', v_fence, 'lease_expires_at', v_expiry);
end;
$$;

create or replace function public.stripe_reconcile_subscription(
  p_program_id uuid, p_brand_id uuid, p_lease_owner uuid, p_fence bigint, p_event_id text,
  p_provider_object_id text, p_stripe_checkout_session_id text, p_checkout_verified_paid boolean,
  p_stripe_customer_id text, p_stripe_subscription_id text, p_stripe_price_id text, p_status text,
  p_current_period_start timestamptz, p_current_period_end timestamptz, p_cancel_at_period_end boolean
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_program public.customer_programs%rowtype; v_existing public.subscriptions%rowtype;
declare v_event public.stripe_events%rowtype; v_effective_program_status text; v_has_existing boolean := false;
declare v_lease public.subscription_reconcile_leases%rowtype;
begin
  perform app_private.require_service_role();
  select * into v_program from public.customer_programs
  where id = p_program_id and brand_id = p_brand_id for update;
  if not found then
    raise exception 'subscription linkage conflict' using errcode = 'P0001';
  end if;
  select * into v_lease from public.subscription_reconcile_leases
  where program_id = p_program_id for update;
  if not found or v_lease.brand_id <> p_brand_id or v_lease.lease_owner <> p_lease_owner
     or v_lease.fence <> p_fence or v_lease.lease_expires_at <= clock_timestamp() then
    raise exception 'stale reconciliation lease' using errcode = 'P0001';
  end if;
  select * into v_event from public.stripe_events where stripe_event_id = p_event_id for update;
  if not found then
    raise exception 'unregistered Stripe event' using errcode = 'P0001';
  end if;
  if v_event.program_id <> p_program_id or v_event.brand_id <> p_brand_id
     or v_event.object_id <> p_provider_object_id then
    raise exception 'conflicting Stripe event use' using errcode = 'P0001';
  end if;
  if v_event.status = 'processed' then
    select status into v_effective_program_status from public.customer_programs where id = p_program_id;
    return jsonb_build_object(
      'subscription_status', (select status from public.subscriptions where program_id = p_program_id),
      'program_status', v_effective_program_status, 'already_processed', true
    );
  end if;
  if v_event.status = 'quarantined' or v_program.price_id_snapshot is distinct from p_stripe_price_id then
    raise exception 'subscription linkage conflict' using errcode = 'P0001';
  end if;
  select * into v_existing from public.subscriptions where program_id = p_program_id for update;
  v_has_existing := found;
  if not v_has_existing then
    if p_stripe_checkout_session_id is null or p_checkout_verified_paid is not true or not exists (
      select 1 from public.checkout_attempts
      where program_id = p_program_id and brand_id = p_brand_id
        and stripe_session_id = p_stripe_checkout_session_id and status in ('linked','expired')
    ) then
      raise exception 'subscription linkage conflict' using errcode = 'P0001';
    end if;
    update public.checkout_attempts set status = 'completed'
    where program_id = p_program_id and stripe_session_id = p_stripe_checkout_session_id
      and status in ('linked','expired');
  end if;
  if v_has_existing and v_existing.stripe_subscription_id is not null
     and v_existing.stripe_subscription_id <> p_stripe_subscription_id then
    raise exception 'subscription linkage conflict' using errcode = 'P0001';
  end if;
  insert into public.subscriptions (
    program_id, brand_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status,
    current_period_start, current_period_end, cancel_at_period_end, last_reconciled_at
  ) values (
    p_program_id, p_brand_id, p_stripe_customer_id, p_stripe_subscription_id, p_stripe_price_id, p_status,
    p_current_period_start, p_current_period_end, coalesce(p_cancel_at_period_end, false), now()
  )
  on conflict (program_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id, status = excluded.status,
    current_period_start = excluded.current_period_start, current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end, last_reconciled_at = excluded.last_reconciled_at;
  if v_program.status = 'not_started' and p_status in ('active','trialing') then
    update public.customer_programs set status = 'active', activated_at = now(),
      start_date = (now() at time zone v_program.timezone_snapshot)::date
    where id = p_program_id and status = 'not_started';
    update public.customer_sessions set expires_at = greatest(expires_at,
      ((now() at time zone v_program.timezone_snapshot)::date + v_program.duration_snapshot + 30)::timestamp
        at time zone v_program.timezone_snapshot)
    where program_id = p_program_id and revoked_at is null;
  end if;
  update public.stripe_events set status = 'processed', attempt_count = attempt_count + 1,
    processed_at = now(), last_error_code = null where stripe_event_id = p_event_id;
  select status into v_effective_program_status from public.customer_programs where id = p_program_id;
  return jsonb_build_object('subscription_status', p_status, 'program_status', v_effective_program_status);
end;
$$;

-- PUBLIC function execution is not an authorization model. Grant only the explicit contract.
revoke all on function public.resolve_brand(text) from public;
revoke all on function public.resolve_access_link(text) from public;
revoke all on function public.customer_join(text,text,text,text,text,uuid,text) from public;
revoke all on function public.customer_dashboard(text,text) from public;
revoke all on function public.customer_complete_today(text,text) from public;
revoke all on function public.customer_undo_today(text,text) from public;
revoke all on function public.customer_checkout_reserve(text,text,uuid) from public;
revoke all on function public.customer_checkout_status(text,text,uuid) from public;
revoke all on function public.admin_create_brand(text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text) from public;
revoke all on function public.admin_edit_brand(uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean) from public;
revoke all on function public.admin_dashboard_counts() from public;
revoke all on function public.admin_brand_list(integer,integer) from public;
revoke all on function public.admin_customer_roster(text,uuid,integer,integer) from public;
revoke all on function public.admin_customer_detail(uuid) from public;
revoke all on function public.admin_ensure_access_link(uuid) from public;
revoke all on function public.stripe_link_checkout_attempt(uuid,text,timestamptz) from public;
revoke all on function public.stripe_resolve_checkout_attempt(uuid,text) from public;
revoke all on function public.stripe_resolve_subscription(text) from public;
revoke all on function public.stripe_register_event(text,text,boolean,text,uuid,uuid,timestamptz) from public;
revoke all on function public.stripe_mark_event_outcome(text,text,text) from public;
revoke all on function public.stripe_claim_reconcile(uuid,uuid,uuid) from public;
revoke all on function public.stripe_reconcile_subscription(uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean) from public;

grant execute on function public.resolve_brand(text), public.resolve_access_link(text),
  public.customer_join(text,text,text,text,text,uuid,text), public.customer_dashboard(text,text),
  public.customer_complete_today(text,text), public.customer_undo_today(text,text),
  public.customer_checkout_reserve(text,text,uuid), public.customer_checkout_status(text,text,uuid)
to anon, authenticated;
grant execute on function public.admin_create_brand(text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text),
  public.admin_edit_brand(uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean),
  public.admin_dashboard_counts(), public.admin_brand_list(integer,integer),
  public.admin_customer_roster(text,uuid,integer,integer), public.admin_customer_detail(uuid),
  public.admin_ensure_access_link(uuid) to authenticated;
grant execute on function public.stripe_link_checkout_attempt(uuid,text,timestamptz),
  public.stripe_resolve_checkout_attempt(uuid,text),
  public.stripe_resolve_subscription(text),
  public.stripe_register_event(text,text,boolean,text,uuid,uuid,timestamptz),
  public.stripe_mark_event_outcome(text,text,text),
  public.stripe_claim_reconcile(uuid,uuid,uuid),
  public.stripe_reconcile_subscription(uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean)
to service_role;