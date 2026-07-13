-- Free lending is now a membership perk — only users with a confirmed
-- (paid) membership_registrations row may create borrow requests. Staff
-- can still create/approve on anyone's behalf as before.

create or replace function public.is_confirmed_member(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.membership_registrations
    where profile_id = uid and status = 'confirmed'
  );
$$;

drop policy "borrow_requests_owner_insert" on public.borrow_requests;

create policy "borrow_requests_member_insert"
  on public.borrow_requests for insert
  with check (
    auth.uid() = requester_id
    and (public.is_confirmed_member(auth.uid()) or public.is_staff(auth.uid()))
  );
