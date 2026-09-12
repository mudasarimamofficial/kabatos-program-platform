-- Optional no-billing activation. It is reachable only for an immutable snapshot that
-- explicitly opted out of subscription billing; normal brand configuration defaults true.
create or replace function public.customer_activate_tracking(
  p_brand_slug text, p_capability text
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v record; v_program public.customer_programs%rowtype; v_start_date date;
begin
  select * into v from app_private.customer_context(p_brand_slug, p_capability);
  select * into v_program from public.customer_programs
  where id = v.program_id and brand_id = v.brand_id for update;
  if not found or v_program.subscription_required_snapshot then
    raise exception 'activation unavailable' using errcode = 'P0001';
  end if;
  if v_program.status = 'not_started' then
    v_start_date := (now() at time zone v_program.timezone_snapshot)::date;
    update public.customer_programs set status = 'active', start_date = v_start_date, activated_at = now()
    where id = v_program.id and status = 'not_started';
    update public.customer_sessions set expires_at = greatest(expires_at,
      (v_start_date + v_program.duration_snapshot + 30)::timestamp at time zone v_program.timezone_snapshot)
    where program_id = v_program.id and revoked_at is null;
    return jsonb_build_object('status', 'active', 'start_date', v_start_date, 'already_activated', false);
  end if;
  if v_program.status = 'active' then
    return jsonb_build_object('status', 'active', 'start_date', v_program.start_date, 'already_activated', true);
  end if;
  raise exception 'activation unavailable' using errcode = 'P0001';
end;
$$;

revoke all on function public.customer_activate_tracking(text,text) from public;
grant execute on function public.customer_activate_tracking(text,text) to anon, authenticated;