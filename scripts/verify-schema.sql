-- Read-only manifest. Run against local after db reset for clean-DB evidence.
-- Running this against linked DEV is inventory evidence only.
do $$
declare table_name text;
begin
  foreach table_name in array array['brands','program_configs','customers','customer_programs',
    'program_usage','subscriptions','access_links','stripe_events','admin_profiles','customer_sessions'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname=table_name and c.relrowsecurity) then
      raise exception 'Missing table or RLS: %', table_name;
    end if;
  end loop;
  if not exists (select 1 from pg_trigger where tgname='customer_programs_snapshot_immutable' and not tgisinternal) then
    raise exception 'Missing snapshot trigger';
  end if;
  if not exists (select 1 from storage.buckets where id='brand-assets' and public and file_size_limit=2097152) then
    raise exception 'Missing configured asset bucket';
  end if;
end $$;
select jsonb_build_object(
  'tables', (select jsonb_agg(jsonb_build_object('name', c.relname, 'rls', c.relrowsecurity) order by c.relname)
    from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
  'policies', (select jsonb_agg(jsonb_build_object('schema', schemaname, 'table', tablename, 'name', policyname, 'roles', roles, 'command', cmd) order by schemaname,tablename,policyname)
    from pg_policies where schemaname in ('public','storage')),
  'functions', (select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'securityDefiner',p.prosecdef) order by n.nspname,p.proname)
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','app_private') and p.proname !~ '^pg'),
  'constraints', (select count(*) from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public'),
  'indexes', (select count(*) from pg_indexes where schemaname='public'),
  'triggers', (select jsonb_agg(tgname order by tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal),
  'bucket', (select jsonb_build_object('id',id,'public',public,'sizeLimit',file_size_limit,'allowedTypes',allowed_mime_types) from storage.buckets where id='brand-assets')
) as manifest;
