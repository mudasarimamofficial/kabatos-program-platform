-- Tenant asset configuration and capability-scoped customer DTO; no seed data.
alter table public.brands add column product_image_path text
  constraint brands_product_image_path_length check (product_image_path is null or length(product_image_path) between 1 and 1024);

create or replace function public.resolve_brand(p_slug text)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public, extensions, app_private as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'slug', b.slug, 'name', b.name, 'logo_path', b.logo_path,
    'primary_color', b.primary_color, 'secondary_color', b.secondary_color,
    'highlight_color', b.highlight_color, 'product_name', b.product_name,
    'reorder_url', b.reorder_url, 'product_image_path', b.product_image_path,
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
    'customer', (select jsonb_build_object('id', c.id, 'first_name', c.first_name) from public.customers c join public.customer_programs p on p.customer_id = c.id where p.id = v.program_id and c.brand_id = v.brand_id),
    'history', (select coalesce(jsonb_agg(jsonb_build_object('scheduled_day', u.scheduled_day, 'completed_at', u.completed_at)), '[]'::jsonb) from public.program_usage u where u.program_id = v.program_id and u.brand_id = v.brand_id),
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
