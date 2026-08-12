-- 排班表: self-service duty roster for the physical store. Staff/volunteers
-- claim open shifts themselves; admin can generate upcoming shifts and
-- reassign/cancel as needed.

create table public.duty_shifts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  assigned_profile_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index duty_shifts_shift_date_idx on public.duty_shifts (shift_date);
create unique index duty_shifts_unique_slot_idx
  on public.duty_shifts (branch_id, shift_date, start_time, end_time);

alter table public.duty_shifts enable row level security;

create trigger set_duty_shifts_updated_at
  before update on public.duty_shifts
  for each row execute function public.set_updated_at();

-- Any signed-in member can see the roster (need to see who's covering what).
create policy "duty_shifts_authenticated_read"
  on public.duty_shifts for select
  using (auth.uid() is not null);

-- Self-claim: only allowed to move a shift from unassigned to yourself.
create policy "duty_shifts_self_claim"
  on public.duty_shifts for update
  using (assigned_profile_id is null or assigned_profile_id = auth.uid() or public.is_staff(auth.uid()))
  with check (assigned_profile_id = auth.uid() or assigned_profile_id is null or public.is_staff(auth.uid()));

create policy "duty_shifts_staff_insert"
  on public.duty_shifts for insert
  with check (public.is_staff(auth.uid()));

create policy "duty_shifts_staff_delete"
  on public.duty_shifts for delete
  using (public.is_staff(auth.uid()));
