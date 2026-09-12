-- Public brand artwork only. Storage is never used for customer data or uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets', 'brand-assets', true, 2097152,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do nothing;

create or replace function app_private.validate_brand_logo_path()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if new.logo_path is not null and (
    new.logo_path !~ ('^' || new.slug || '/[A-Za-z0-9][A-Za-z0-9._-]{0,239}\.(png|jpg|jpeg|webp)$')
  ) then
    raise exception 'logo path must be a raster object under its brand slug' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function app_private.validate_brand_logo_path() from public, anon, authenticated;

create trigger brands_logo_path_valid before insert or update of slug, logo_path on public.brands
for each row execute function app_private.validate_brand_logo_path();

create policy brand_assets_public_read on storage.objects for select
  using (bucket_id = 'brand-assets');

create policy brand_assets_admin_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'brand-assets'
    and app_private.is_active_admin()
    and (storage.foldername(name))[1] is not null
    and exists (
      select 1 from public.brands b
      where b.slug = (storage.foldername(name))[1]
    )
  );

create policy brand_assets_admin_update on storage.objects for update to authenticated
  using (
    bucket_id = 'brand-assets'
    and app_private.is_active_admin()
    and exists (
      select 1 from public.brands b
      where b.slug = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'brand-assets'
    and app_private.is_active_admin()
    and exists (
      select 1 from public.brands b
      where b.slug = (storage.foldername(name))[1]
    )
  );

create policy brand_assets_admin_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'brand-assets'
    and app_private.is_active_admin()
    and exists (
      select 1 from public.brands b
      where b.slug = (storage.foldername(name))[1]
    )
  );