-- A capability can revoke itself; no identity lookup or cross-tenant data is returned.
create or replace function public.customer_revoke_session(p_capability text)
returns void language plpgsql security definer
set search_path = pg_catalog, public, extensions as $$
begin
  if p_capability is null or p_capability !~ '^[A-Za-z0-9_-]{43}$' then return; end if;
  update public.customer_sessions set revoked_at = now()
    where token_hash = digest(convert_to(p_capability, 'UTF8'), 'sha256') and revoked_at is null;
end;
$$;
revoke all on function public.customer_revoke_session(text) from public;
grant execute on function public.customer_revoke_session(text) to anon, authenticated;
