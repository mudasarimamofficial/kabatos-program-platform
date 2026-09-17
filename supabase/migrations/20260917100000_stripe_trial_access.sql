-- Preserve existing ownership, reconcile fences and immutable program snapshots.
alter table public.subscriptions add column trial_start timestamptz,
  add column trial_end timestamptz, add column canceled_at timestamptz,
  add constraint subscription_trial_dates_valid check (trial_end is null or trial_start is null or trial_end > trial_start);
alter table public.checkout_attempts drop constraint checkout_attempts_session_valid;
alter table public.checkout_attempts add constraint checkout_attempts_session_valid
  check (stripe_session_id is null or stripe_session_id ~ '^cs_test_[A-Za-z0-9]{3,250}$');

create or replace function public.stripe_link_checkout_attempt(
  p_attempt_id uuid, p_stripe_session_id text, p_expires_at timestamptz
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, app_private as $$
declare v public.checkout_attempts%rowtype;
begin
  perform app_private.require_service_role();
  if p_stripe_session_id is null or p_stripe_session_id !~ '^cs_test_[A-Za-z0-9]{3,250}$'
    or p_expires_at is null or p_expires_at <= now() then raise exception 'invalid checkout linkage'; end if;
  select * into v from public.checkout_attempts where id = p_attempt_id for update;
  if not found or v.status not in ('reserved','linked') or v.expires_at <= now()
    or (v.stripe_session_id is not null and v.stripe_session_id <> p_stripe_session_id)
    then raise exception 'checkout attempt unavailable'; end if;
  update public.checkout_attempts set stripe_session_id = p_stripe_session_id,
    status = 'linked', expires_at = p_expires_at where id = p_attempt_id;
  return jsonb_build_object('attempt_id',p_attempt_id,'status','linked');
end; $$;

create function app_private.program_access(p_program_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select exists(select 1 from public.customer_programs p join public.brands b on b.id=p.brand_id
    left join public.subscriptions s on s.program_id=p.id and s.brand_id=p.brand_id
    where p.id=p_program_id and b.active and p.status in ('active','completed') and
      (not p.subscription_required_snapshot or (s.status in ('trialing','active') and
         case when s.status='trialing' then s.trial_end else s.current_period_end end > now())))
$$;
revoke all on function app_private.program_access(uuid) from public,anon,authenticated;

-- Preserve proven tracking functions behind a shared database billing gate.
alter function public.customer_dashboard(text,text) set schema app_private;
alter function public.customer_complete_today(text,text) set schema app_private;
alter function public.customer_undo_today(text,text) set schema app_private;
revoke all on function app_private.customer_dashboard(text,text),
  app_private.customer_complete_today(text,text),app_private.customer_undo_today(text,text) from public,anon,authenticated;
create function public.customer_dashboard(p_brand_slug text,p_capability text)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog, public, app_private as $$
declare v record;
begin
  select * into v from app_private.customer_context(p_brand_slug,p_capability);
  if not app_private.program_access(v.program_id) then raise exception 'subscription access required'; end if;
  return app_private.customer_dashboard(p_brand_slug,p_capability);
end; $$;
create function public.customer_complete_today(p_brand_slug text,p_capability text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, app_private as $$
declare v record;
begin
  select * into v from app_private.customer_context(p_brand_slug,p_capability);
  perform 1 from public.customer_programs where id=v.program_id for update;
  if not app_private.program_access(v.program_id) then raise exception 'subscription access required'; end if;
  return app_private.customer_complete_today(p_brand_slug,p_capability);
end; $$;
create function public.customer_undo_today(p_brand_slug text,p_capability text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, app_private as $$
declare v record;
begin
  select * into v from app_private.customer_context(p_brand_slug,p_capability);
  perform 1 from public.customer_programs where id=v.program_id for update;
  if not app_private.program_access(v.program_id) then raise exception 'subscription access required'; end if;
  return app_private.customer_undo_today(p_brand_slug,p_capability);
end; $$;

create function public.customer_subscription_status(p_brand_slug text,p_capability text)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog, public, app_private as $$
declare v record; s public.subscriptions%rowtype;
begin
  select * into v from app_private.customer_context(p_brand_slug,p_capability);
  select * into s from public.subscriptions where program_id=v.program_id and brand_id=v.brand_id;
  return jsonb_build_object('required',v.subscription_required,'status',s.status,
    'access',app_private.program_access(v.program_id),'trial_start',s.trial_start,'trial_end',s.trial_end,
    'current_period_start',s.current_period_start,'current_period_end',s.current_period_end,
    'cancel_at_period_end',coalesce(s.cancel_at_period_end,false),'canceled_at',s.canceled_at);
end; $$;
create function public.stripe_customer_subscription_context(p_brand_slug text,p_capability text)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog, public, app_private as $$
declare v record; s public.subscriptions%rowtype;
begin
  perform app_private.require_service_role();
  select * into v from app_private.customer_context(p_brand_slug,p_capability);
  select * into s from public.subscriptions where program_id=v.program_id and brand_id=v.brand_id;
  if not found then raise exception 'subscription unavailable'; end if;
  return jsonb_build_object('program_id',v.program_id,'brand_id',v.brand_id,
    'stripe_subscription_id',s.stripe_subscription_id,'stripe_customer_id',s.stripe_customer_id);
end; $$;

create function public.stripe_reconcile_subscription_v2(
  p_program_id uuid,p_brand_id uuid,p_lease_owner uuid,p_fence bigint,p_event_id text,
  p_provider_object_id text,p_stripe_checkout_session_id text,p_checkout_verified_complete boolean,
  p_stripe_customer_id text,p_stripe_subscription_id text,p_stripe_price_id text,p_status text,
  p_current_period_start timestamptz,p_current_period_end timestamptz,p_cancel_at_period_end boolean,
  p_trial_start timestamptz,p_trial_end timestamptz,p_canceled_at timestamptz
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public, app_private as $$
declare result jsonb;
begin
  perform app_private.require_service_role();
  -- Legacy boolean covers paid OR a completed, verified no-payment-required trial Checkout.
  result := public.stripe_reconcile_subscription(p_program_id,p_brand_id,p_lease_owner,p_fence,p_event_id,
    p_provider_object_id,p_stripe_checkout_session_id,p_checkout_verified_complete,p_stripe_customer_id,
    p_stripe_subscription_id,p_stripe_price_id,p_status,p_current_period_start,p_current_period_end,p_cancel_at_period_end);
  if not coalesce((result->>'already_processed')::boolean,false) then
    update public.subscriptions set trial_start=p_trial_start,trial_end=p_trial_end,canceled_at=p_canceled_at
      where program_id=p_program_id and brand_id=p_brand_id;
    if p_status in ('trialing','active') then
      update public.customer_sessions set expires_at=greatest(expires_at,now()+interval '90 days')
        where program_id=p_program_id and brand_id=p_brand_id and revoked_at is null;
    end if;
  end if;
  return result;
end; $$;
create function public.stripe_release_reconcile(p_program_id uuid,p_lease_owner uuid,p_fence bigint)
returns void language plpgsql security definer set search_path = pg_catalog,public,app_private as $$
begin
  perform app_private.require_service_role();
  update public.subscription_reconcile_leases set lease_expires_at=clock_timestamp()
    where program_id=p_program_id and lease_owner=p_lease_owner and fence=p_fence;
end; $$;

revoke all on function public.customer_dashboard(text,text),public.customer_complete_today(text,text),
  public.customer_undo_today(text,text),public.customer_subscription_status(text,text) from public,anon,authenticated;
grant execute on function public.customer_dashboard(text,text),public.customer_complete_today(text,text),
  public.customer_undo_today(text,text),public.customer_subscription_status(text,text) to anon,authenticated;
revoke all on function public.stripe_customer_subscription_context(text,text),
  public.stripe_reconcile_subscription_v2(uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean,timestamptz,timestamptz,timestamptz),
  public.stripe_release_reconcile(uuid,uuid,bigint) from public,anon,authenticated;
grant execute on function public.stripe_customer_subscription_context(text,text),
  public.stripe_reconcile_subscription_v2(uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean,timestamptz,timestamptz,timestamptz),
  public.stripe_release_reconcile(uuid,uuid,bigint) to service_role;

-- Immediate customer confirmation uses the authoritative Stripe update response under the same fence.
create function public.stripe_persist_cancellation(p_program_id uuid,p_lease_owner uuid,p_fence bigint,
  p_subscription_id text,p_canceled_at timestamptz)
returns void language plpgsql security definer set search_path=pg_catalog,public,app_private as $$
begin
  perform app_private.require_service_role();
  perform 1 from public.customer_programs where id=p_program_id for update;
  if not exists(select 1 from public.subscription_reconcile_leases where program_id=p_program_id
    and lease_owner=p_lease_owner and fence=p_fence and lease_expires_at>clock_timestamp()) then
    raise exception 'stale reconciliation lease'; end if;
  update public.subscriptions set cancel_at_period_end=true,canceled_at=p_canceled_at
    where program_id=p_program_id and stripe_subscription_id=p_subscription_id;
  if not found then raise exception 'subscription ownership unavailable'; end if;
end; $$;
revoke all on function public.stripe_persist_cancellation(uuid,uuid,bigint,text,timestamptz) from public,anon,authenticated;
grant execute on function public.stripe_persist_cancellation(uuid,uuid,bigint,text,timestamptz) to service_role;
