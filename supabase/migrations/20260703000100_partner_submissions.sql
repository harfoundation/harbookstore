-- Service partners (external publishers/ministries) can submit books and
-- courses for Har Bookstore admin review before they go live.

alter table public.profiles
  drop constraint profiles_role_check,
  add constraint profiles_role_check
    check (role in ('member', 'admin', 'committee', 'instructor', 'partner'));

create or replace function public.is_partner(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'partner');
$$;

-- books --------------------------------------------------------------------

alter table public.books
  add column submitted_by uuid references public.profiles(id) on delete set null,
  add column approval_status text not null default 'approved'
    check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  add column review_notes text;

-- Existing admin-only write policy stays for admin. Add partner submission.
create policy "books_partner_insert_own_pending"
  on public.books for insert
  with check (
    public.is_partner(auth.uid())
    and submitted_by = auth.uid()
    and approval_status = 'pending_review'
    and is_active = false
  );

create policy "books_partner_select_own"
  on public.books for select
  using (submitted_by = auth.uid());

create policy "books_partner_update_own_pending_or_rejected"
  on public.books for update
  using (
    submitted_by = auth.uid()
    and approval_status in ('pending_review', 'rejected')
  )
  with check (submitted_by = auth.uid());

-- Only admin may change approval_status/is_active/submitted_by, even for the
-- partner's own row — prevents self-approval.
create or replace function public.enforce_book_approval_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin(auth.uid()) then
    return new;
  end if;
  if new.approval_status is distinct from old.approval_status
    or new.is_active is distinct from old.is_active
    or new.submitted_by is distinct from old.submitted_by
  then
    raise exception 'Only staff may change approval status, active state, or submitter';
  end if;
  return new;
end;
$$;

create trigger enforce_books_approval_permissions
  before update on public.books
  for each row execute function public.enforce_book_approval_permissions();

-- courses --------------------------------------------------------------------

alter table public.courses
  add column submitted_by uuid references public.profiles(id) on delete set null,
  add column approval_status text not null default 'approved'
    check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  add column review_notes text;

create policy "courses_partner_insert_own_pending"
  on public.courses for insert
  with check (
    public.is_partner(auth.uid())
    and submitted_by = auth.uid()
    and approval_status = 'pending_review'
    and is_published = false
  );

create policy "courses_partner_select_own"
  on public.courses for select
  using (submitted_by = auth.uid());

create policy "courses_partner_update_own_pending_or_rejected"
  on public.courses for update
  using (
    submitted_by = auth.uid()
    and approval_status in ('pending_review', 'rejected')
  )
  with check (submitted_by = auth.uid());

create or replace function public.enforce_course_approval_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin(auth.uid()) then
    return new;
  end if;
  if new.approval_status is distinct from old.approval_status
    or new.is_published is distinct from old.is_published
    or new.submitted_by is distinct from old.submitted_by
  then
    raise exception 'Only staff may change approval status, published state, or submitter';
  end if;
  return new;
end;
$$;

create trigger enforce_courses_approval_permissions
  before update on public.courses
  for each row execute function public.enforce_course_approval_permissions();
