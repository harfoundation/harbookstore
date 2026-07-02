-- borrow_requests (免费借书) --------------------------------------------
-- 'volunteer_courier' is a reserved-but-unimplemented delivery_method value;
-- no matching/logistics logic is built for it in the MVP.

create table public.borrow_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'picked_up', 'returned', 'cancelled')),
  delivery_method text not null default 'self_pickup'
    check (delivery_method in ('self_pickup', 'mail', 'volunteer_courier')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  picked_up_at timestamptz,
  due_at timestamptz,
  returned_at timestamptz,
  admin_notes text
);

create index borrow_requests_requester_id_idx on public.borrow_requests (requester_id);
create index borrow_requests_status_idx on public.borrow_requests (status);

alter table public.borrow_requests enable row level security;

create policy "borrow_requests_owner_or_staff_read"
  on public.borrow_requests for select
  using (auth.uid() = requester_id or public.is_staff(auth.uid()));

create policy "borrow_requests_owner_insert"
  on public.borrow_requests for insert
  with check (auth.uid() = requester_id);

-- Owner may only cancel their own request while it's still pending;
-- every other transition (approve/pick-up/return) is admin-only.
create policy "borrow_requests_owner_or_admin_update"
  on public.borrow_requests for update
  using (auth.uid() = requester_id or public.is_admin(auth.uid()))
  with check (auth.uid() = requester_id or public.is_admin(auth.uid()));

create or replace function public.enforce_borrow_request_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

create trigger enforce_borrow_requests_update_permissions
  before update on public.borrow_requests
  for each row execute function public.enforce_borrow_request_update_permissions();
