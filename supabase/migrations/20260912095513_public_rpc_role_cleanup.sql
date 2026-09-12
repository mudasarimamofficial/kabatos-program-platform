-- Customer entry points use the publishable/anon client. Authenticated users
-- do not need a second execution path, so keep the exposed surface narrower.
revoke execute on function public.resolve_brand(text),
  public.resolve_access_link(text),
  public.customer_join(text,text,text,text,text,uuid,text),
  public.customer_dashboard(text,text),
  public.customer_complete_today(text,text),
  public.customer_undo_today(text,text),
  public.customer_checkout_reserve(text,text,uuid),
  public.customer_checkout_status(text,text,uuid),
  public.customer_activate_tracking(text,text)
from authenticated;

grant execute on function public.resolve_brand(text),
  public.resolve_access_link(text),
  public.customer_join(text,text,text,text,text,uuid,text),
  public.customer_dashboard(text,text),
  public.customer_complete_today(text,text),
  public.customer_undo_today(text,text),
  public.customer_checkout_reserve(text,text,uuid),
  public.customer_checkout_status(text,text,uuid),
  public.customer_activate_tracking(text,text)
to anon;