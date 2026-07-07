-- Sunday attendance check-in — digitises the paper "主日/下午崇拜出席表"
-- sign-in sheets. Internal usher/staff tool holding attendee PII, so
-- everything here is staff-only (never publicly readable), unlike the
-- member-facing tables elsewhere in the schema.

create table public.congregations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_period text not null check (service_period in ('morning', 'afternoon', 'evening')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.congregations enable row level security;

create policy "congregations_staff_all"
  on public.congregations for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- congregation_members: the standing roster (regulars + co-workers) that
-- gets checked off each week — independent of platform accounts, since most
-- attendees never sign up for the website.

create table public.congregation_members (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id) on delete cascade,
  display_name text not null,
  member_type text not null default 'regular' check (member_type in ('regular', 'co_worker')),
  notes text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index congregation_members_congregation_id_idx on public.congregation_members (congregation_id);

alter table public.congregation_members enable row level security;

create policy "congregation_members_staff_all"
  on public.congregation_members for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- attendance_sessions: one per (congregation, date) — created on demand the
-- first time someone opens the check-in tool for that Sunday.

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id) on delete cascade,
  service_date date not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (congregation_id, service_date)
);

alter table public.attendance_sessions enable row level security;

create policy "attendance_sessions_staff_all"
  on public.attendance_sessions for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- attendance_checkins: either a roster member checking in (member_id set —
-- "打卡"), or a fresh walk-in recorded on the spot (member_id null, always
-- member_type = 'new_friend'). The unique constraint stops a roster member
-- being checked in twice for the same session; NULL member_ids (walk-ins)
-- are never considered equal to each other under a unique index, so multiple
-- new friends per session are unaffected.

create table public.attendance_checkins (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  member_id uuid references public.congregation_members(id) on delete set null,
  display_name text not null,
  member_type text not null check (member_type in ('regular', 'co_worker', 'new_friend')),
  notes text,
  checked_in_at timestamptz not null default now(),
  unique (session_id, member_id)
);

create index attendance_checkins_session_id_idx on public.attendance_checkins (session_id);

alter table public.attendance_checkins enable row level security;

create policy "attendance_checkins_staff_all"
  on public.attendance_checkins for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
