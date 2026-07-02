-- The admin-only column-protection triggers on orders/borrow_requests check
-- is_admin(auth.uid()), but auth.uid() resolves to null for service-role
-- calls (no JWT `sub` claim), so a legitimate trusted backend job (e.g. a
-- future payment-webhook handler) using the service-role key would be
-- blocked even though the service role is already fully trusted. Allow
-- auth.role() = 'service_role' to bypass these triggers, matching how RLS
-- itself already treats the service role.

create or replace function public.enforce_order_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if not public.is_admin(auth.uid()) then
    if new.status is distinct from old.status
      or new.payment_received_at is distinct from old.payment_received_at
      or new.payment_method is distinct from old.payment_method
    then
      raise exception 'Only staff may change order status or payment fields';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_borrow_request_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if not public.is_admin(auth.uid()) then
    if new.status is distinct from old.status and new.status != 'cancelled' then
      raise exception 'Only staff may change borrow request status beyond cancelling';
    end if;
    if old.status != 'requested' and new.status = 'cancelled' then
      raise exception 'Cannot cancel a borrow request that is no longer pending';
    end if;
  end if;
  return new;
end;
$$;
