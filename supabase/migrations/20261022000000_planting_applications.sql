-- HAR 植堂學院 applications ---------------------------------------------------
-- Prospective church planters apply for a cohort; staff (Keith and the
-- training team) interview them and record a decision. Applicants can read
-- their own application row (incl. status), so interview notes live in a
-- separate staff-only table rather than a column they could select.

create table public.planting_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  cohort_label text not null,
  full_name text not null,
  contact_email text not null,
  contact_phone text,
  home_church text,
  referee_name text,
  referee_contact text,
  -- 實務軌 (has seminary training) vs 基礎＋實務軌 (doesn't)
  track text not null check (track in ('practical', 'foundation_practical')),
  seminary_background text,
  planting_vision text not null,
  weekly_hours int check (weekly_hours is null or weekly_hours between 0 and 80),
  status text not null default 'submitted'
    check (status in ('submitted', 'interview', 'accepted', 'waitlist', 'declined')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index planting_applications_status_idx on public.planting_applications (status, created_at desc);
create unique index planting_applications_one_per_cohort on public.planting_applications (profile_id, cohort_label);

alter table public.planting_applications enable row level security;

create trigger set_planting_applications_updated_at
  before update on public.planting_applications
  for each row execute function public.set_updated_at();

create policy "planting_applications_owner_or_staff_read"
  on public.planting_applications for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "planting_applications_owner_insert"
  on public.planting_applications for insert
  with check (
    auth.uid() = profile_id
    and status = 'submitted'
    and reviewed_by is null
  );

create policy "planting_applications_staff_update"
  on public.planting_applications for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create table public.planting_application_notes (
  application_id uuid primary key references public.planting_applications(id) on delete cascade,
  interview_notes text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.planting_application_notes enable row level security;

create trigger set_planting_application_notes_updated_at
  before update on public.planting_application_notes
  for each row execute function public.set_updated_at();

create policy "planting_application_notes_staff_all"
  on public.planting_application_notes for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
