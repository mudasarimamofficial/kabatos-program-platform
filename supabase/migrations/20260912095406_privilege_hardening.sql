-- Supabase projects may have explicit default EXECUTE grants for anon and
-- authenticated. Remove those grants explicitly for trusted RPCs.
revoke all on function public.admin_create_brand(
  text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text
) from public, anon, authenticated;
revoke all on function public.admin_edit_brand(
  uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean
) from public, anon, authenticated;
revoke all on function public.admin_dashboard_counts() from public, anon, authenticated;
revoke all on function public.admin_brand_list(integer,integer) from public, anon, authenticated;
revoke all on function public.admin_customer_roster(text,uuid,integer,integer) from public, anon, authenticated;
revoke all on function public.admin_customer_detail(uuid) from public, anon, authenticated;
revoke all on function public.admin_ensure_access_link(uuid) from public, anon, authenticated;

grant execute on function public.admin_create_brand(
  text,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text
) to authenticated;
grant execute on function public.admin_edit_brand(
  uuid,integer,text,text,text,text,text,text,text,text,integer,integer[],text,text,integer,boolean,text,boolean
) to authenticated;
grant execute on function public.admin_dashboard_counts() to authenticated;
grant execute on function public.admin_brand_list(integer,integer) to authenticated;
grant execute on function public.admin_customer_roster(text,uuid,integer,integer) to authenticated;
grant execute on function public.admin_customer_detail(uuid) to authenticated;
grant execute on function public.admin_ensure_access_link(uuid) to authenticated;

revoke all on function public.stripe_link_checkout_attempt(uuid,text,timestamptz) from public, anon, authenticated;
revoke all on function public.stripe_resolve_checkout_attempt(uuid,text) from public, anon, authenticated;
revoke all on function public.stripe_resolve_subscription(text) from public, anon, authenticated;
revoke all on function public.stripe_register_event(text,text,boolean,text,uuid,uuid,timestamptz) from public, anon, authenticated;
revoke all on function public.stripe_mark_event_outcome(text,text,text) from public, anon, authenticated;
revoke all on function public.stripe_claim_reconcile(uuid,uuid,uuid) from public, anon, authenticated;
revoke all on function public.stripe_reconcile_subscription(
  uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean
) from public, anon, authenticated;

grant execute on function public.stripe_link_checkout_attempt(uuid,text,timestamptz),
  public.stripe_resolve_checkout_attempt(uuid,text),
  public.stripe_resolve_subscription(text),
  public.stripe_register_event(text,text,boolean,text,uuid,uuid,timestamptz),
  public.stripe_mark_event_outcome(text,text,text),
  public.stripe_claim_reconcile(uuid,uuid,uuid),
  public.stripe_reconcile_subscription(
    uuid,uuid,uuid,bigint,text,text,text,boolean,text,text,text,text,timestamptz,timestamptz,boolean
  ) to service_role;