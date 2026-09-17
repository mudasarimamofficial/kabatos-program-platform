-- Run only against verified DEV/local with this setting in the SAME connection:
--   SET app.kabatos_environment = 'development';
-- This script intentionally fails closed if that guard is absent or not development.
begin;

do $$
begin
  if current_setting('app.kabatos_environment', true) is distinct from 'development' then
    raise exception 'DEV seed refused: app.kabatos_environment must be development';
  end if;
end;
$$;

insert into public.brands (
  slug, name, logo_path, product_image_path, primary_color, secondary_color, highlight_color, product_name,
  reorder_url, active, timezone, config_revision
) values
  ('comprex', 'COMPREX', null, null, '#F07106', '#8B6F47', '#FDEEE1', 'COMPREX', null, true, 'UTC', 1),
  ('demo-wellness', 'Demo Wellness', null, null, '#246B5A', '#6D8B7A', '#EAF4EE', 'Wellness 10', null, true, 'UTC', 1)
on conflict (slug) do nothing;

insert into public.program_configs (
  brand_id, version, duration_days, schedule_days, usage_title, usage_instructions,
  running_low_days, subscription_required, stripe_price_id, is_current
)
select b.id, 1, 14, array[1,3,5,7,9,11,13], 'Scheduled use', '', 3, true, null, true
from public.brands b
where b.slug = 'comprex'
  and not exists (select 1 from public.program_configs c where c.brand_id = b.id and c.is_current)
union all
select b.id, 1, 10, array[2,4,6,8,10], 'Scheduled use', '', 2, true, null, true
from public.brands b
where b.slug = 'demo-wellness'
  and not exists (select 1 from public.program_configs c where c.brand_id = b.id and c.is_current);

commit;