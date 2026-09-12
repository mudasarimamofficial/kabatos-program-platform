-- Constrained administrator mutation/read DTOs and service-role payment executor.
create or replace function public.admin_create_brand(
  p_slug text, p_name text, p_logo_path text, p_primary_color text, p_secondary_color text,
  p_highlight_color text, p_product_name text, p_reorder_url text, p_timezone text,
  p_duration_days integer, p_schedule_days integer[], p_usage_title text,
  p_usage_instructions text, p_running_low_days integer, p_subscription_required boolean,
  p_stripe_price_id text
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_brand_id uuid; v_config_id uuid;
begin
  perform app_private.require_admin();
  if p_slug is distinct from lower(p_slug) then
    raise exception 'slug must be lowercase' using errcode = 'P0001';
  end if;
  insert into public.brands (
    slug, name, logo_path, primary_color, secondary_color, highlight_color,
    product_name, reorder_url, timezone, config_revision
  ) values (
    p_slug, btrim(p_name), nullif(btrim(p_logo_path), ''), p_primary_color, p_secondary_color,
    p_highlight_color, btrim(p_product_name), nullif(btrim(p_reorder_url), ''), p_timezone, 1
  ) returning id into v_brand_id;
  insert into public.program_configs (
    brand_id, version, duration_days, schedule_days, usage_title, usage_instructions,
    running_low_days, subscription_required, stripe_price_id, is_current
  ) values (
    v_brand_id, 1, p_duration_days, p_schedule_days, btrim(p_usage_title),
    coalesce(p_usage_instructions, ''), p_running_low_days, p_subscription_required,
    nullif(btrim(p_stripe_price_id), ''), true
  ) returning id into v_config_id;
  return jsonb_build_object('brand_id', v_brand_id, 'version', 1);
end;
$$;

create or replace function public.admin_edit_brand(
  p_brand_id uuid, p_expected_version integer, p_name text, p_logo_path text,
  p_primary_color text, p_secondary_color text, p_highlight_color text, p_product_name text,
  p_reorder_url text, p_timezone text, p_duration_days integer, p_schedule_days integer[],
  p_usage_title text, p_usage_instructions text, p_running_low_days integer,
  p_subscription_required boolean, p_stripe_price_id text, p_active boolean
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_brand public.brands%rowtype; v_current public.program_configs%rowtype; v_next integer;
begin
  perform app_private.require_admin();
  select * into v_brand from public.brands where id = p_brand_id for update;
  if not found then raise exception 'brand not found' using errcode = 'P0001'; end if;
  select * into v_current from public.program_configs
    where brand_id = p_brand_id and is_current for update;
  if not found or v_current.version <> p_expected_version then
    raise exception 'stale configuration' using errcode = 'P0001';
  end if;
  v_next := v_current.version + 1;
  update public.brands set
    name = btrim(p_name), logo_path = nullif(btrim(p_logo_path), ''),
    primary_color = p_primary_color, secondary_color = p_secondary_color,
    highlight_color = p_highlight_color, product_name = btrim(p_product_name),
    reorder_url = nullif(btrim(p_reorder_url), ''), timezone = p_timezone,
    active = p_active, config_revision = v_next
  where id = p_brand_id;
  update public.program_configs set is_current = false where id = v_current.id;
  insert into public.program_configs (
    brand_id, version, duration_days, schedule_days, usage_title, usage_instructions,
    running_low_days, subscription_required, stripe_price_id, is_current
  ) values (
    p_brand_id, v_next, p_duration_days, p_schedule_days, btrim(p_usage_title),
    coalesce(p_usage_instructions, ''), p_running_low_days, p_subscription_required,
    nullif(btrim(p_stripe_price_id), ''), true
  );
  return jsonb_build_object('brand_id', p_brand_id, 'version', v_next);
end;
$$;

create or replace function public.admin_dashboard_counts()
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
begin
  perform app_private.require_admin();
  return jsonb_build_object(
    'brands', (select count(*) from public.brands),
    'customers', (select count(*) from public.customers),
    'active_programs', (
      select count(*) from public.customer_programs p
      where p.status = 'active'
        and (now() at time zone p.timezone_snapshot)::date <= p.start_date + (p.duration_snapshot - 1)
    ),
    'active_subscriptions', (
      select count(*) from public.subscriptions where status in ('active','trialing')
    )
  );
end;
$$;

create or replace function public.admin_brand_list(p_limit integer default 50, p_offset integer default 0)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
begin
  perform app_private.require_admin();
  if p_limit not between 1 and 100 or p_offset < 0 then
    raise exception 'invalid pagination' using errcode = 'P0001';
  end if;
  return coalesce((
    select jsonb_agg(row_data order by (row_data->>'name'))
    from (
      select jsonb_build_object(
        'id', b.id, 'slug', b.slug, 'name', b.name, 'logo_path', b.logo_path,
        'primary_color', b.primary_color, 'secondary_color', b.secondary_color,
        'highlight_color', b.highlight_color, 'product_name', b.product_name,
        'reorder_url', b.reorder_url, 'active', b.active, 'timezone', b.timezone,
        'config_version', b.config_revision,
        'customer_count', (select count(*) from public.customers cu where cu.brand_id = b.id),
        'current_config', jsonb_build_object(
          'duration_days', c.duration_days, 'schedule_days', c.schedule_days,
          'usage_title', c.usage_title, 'usage_instructions', c.usage_instructions,
          'running_low_days', c.running_low_days, 'subscription_required', c.subscription_required,
          'stripe_price_id', c.stripe_price_id
        )
      ) as row_data
      from public.brands b join public.program_configs c on c.brand_id = b.id and c.is_current
      order by b.name, b.id limit p_limit offset p_offset
    ) q
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_customer_roster(
  p_search text default null, p_brand_id uuid default null, p_limit integer default 50, p_offset integer default 0
) returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
begin
  perform app_private.require_admin();
  if p_limit not between 1 and 100 or p_offset < 0 or (p_search is not null and length(p_search) > 254) then
    raise exception 'invalid roster query' using errcode = 'P0001';
  end if;
  return coalesce((
    select jsonb_agg(row_data order by (row_data->>'created_at') desc)
    from (
      select jsonb_build_object(
        'customer_id', cu.id, 'first_name', cu.first_name, 'email', cu.email, 'phone', cu.phone,
        'order_number', cu.order_number, 'created_at', cu.created_at,
        'brand', jsonb_build_object('id', b.id, 'slug', b.slug, 'name', b.name),
        'program_status', case
          when cp.status = 'active' and (now() at time zone cp.timezone_snapshot)::date > cp.start_date + (cp.duration_snapshot - 1)
            then 'completed' else cp.status end,
        'start_date', cp.start_date,
        'current_day', case when cp.start_date is null then null else greatest(1, least(cp.duration_snapshot,
          (now() at time zone cp.timezone_snapshot)::date - cp.start_date + 1)) end,
        'subscription_status', s.status
      ) as row_data
      from public.customers cu
      join public.brands b on b.id = cu.brand_id
      join lateral (
        select p.* from public.customer_programs p where p.customer_id = cu.id order by p.created_at desc limit 1
      ) cp on true
      left join public.subscriptions s on s.program_id = cp.id
      where (p_brand_id is null or cu.brand_id = p_brand_id)
        and (p_search is null or concat_ws(' ', cu.first_name, cu.email, cu.phone, cu.order_number) ilike '%' || p_search || '%')
      order by cu.created_at desc limit p_limit offset p_offset
    ) q
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_customer_detail(p_customer_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_result jsonb;
begin
  perform app_private.require_admin();
  select jsonb_build_object(
    'customer', jsonb_build_object(
      'id', cu.id, 'first_name', cu.first_name, 'email', cu.email, 'phone', cu.phone,
      'order_number', cu.order_number, 'created_at', cu.created_at
    ),
    'brand', jsonb_build_object('id', b.id, 'slug', b.slug, 'name', b.name),
    'programs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'status', p.status, 'config_id', p.config_id, 'duration_days', p.duration_snapshot,
        'schedule_days', p.schedule_snapshot, 'usage_title', p.usage_title_snapshot,
        'usage_instructions', p.usage_instructions_snapshot, 'running_low_days', p.low_threshold_snapshot,
        'timezone', p.timezone_snapshot, 'subscription_required', p.subscription_required_snapshot,
        'stripe_price_id', p.price_id_snapshot, 'start_date', p.start_date, 'activated_at', p.activated_at,
        'created_at', p.created_at,
        'usage', coalesce((select jsonb_agg(jsonb_build_object(
          'scheduled_day', u.scheduled_day, 'scheduled_date', u.scheduled_date, 'completed_at', u.completed_at
        ) order by u.scheduled_day) from public.program_usage u where u.program_id = p.id), '[]'::jsonb),
        'subscription', (select jsonb_build_object(
          'status', s.status, 'stripe_price_id', s.stripe_price_id,
          'current_period_start', s.current_period_start, 'current_period_end', s.current_period_end,
          'cancel_at_period_end', s.cancel_at_period_end, 'last_reconciled_at', s.last_reconciled_at
        ) from public.subscriptions s where s.program_id = p.id)
      ) order by p.created_at desc)
      from public.customer_programs p where p.customer_id = cu.id
    ), '[]'::jsonb)
  ) into v_result
  from public.customers cu join public.brands b on b.id = cu.brand_id
  where cu.id = p_customer_id;
  if v_result is null then raise exception 'customer not found' using errcode = 'P0001'; end if;
  return v_result;
end;
$$;

create or replace function public.admin_ensure_access_link(p_brand_id uuid)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_code text;
begin
  perform app_private.require_admin();
  if not exists (select 1 from public.brands where id = p_brand_id) then
    raise exception 'brand not found' using errcode = 'P0001';
  end if;
  select code into v_code from public.access_links where brand_id = p_brand_id and active;
  if v_code is null then
    loop
      v_code := replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_');
      v_code := replace(v_code, '=', '');
      begin
        insert into public.access_links (brand_id, code) values (p_brand_id, v_code);
        exit;
      exception when unique_violation then
        -- Collision is retried; a concurrent link creation is reread below.
        select code into v_code from public.access_links where brand_id = p_brand_id and active;
        if v_code is not null then exit; end if;
      end;
    end loop;
  end if;
  return jsonb_build_object('code', v_code, 'active', true);
end;
$$;

revoke all on function public.admin_create_brand(text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text) from public;
revoke all on function public.admin_edit_brand(uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean) from public;
revoke all on function public.admin_dashboard_counts() from public;
revoke all on function public.admin_brand_list(integer,integer) from public;
revoke all on function public.admin_customer_roster(text,uuid,integer,integer) from public;
revoke all on function public.admin_customer_detail(uuid) from public;
revoke all on function public.admin_ensure_access_link(uuid) from public;
grant execute on function public.admin_create_brand(text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text),
  public.admin_edit_brand(uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean),
  public.admin_dashboard_counts(), public.admin_brand_list(integer,integer),
  public.admin_customer_roster(text,uuid,integer,integer), public.admin_customer_detail(uuid),
  public.admin_ensure_access_link(uuid) to authenticated;