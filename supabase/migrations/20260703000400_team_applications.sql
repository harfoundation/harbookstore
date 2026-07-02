-- "加入我們" — volunteer/staff (同工) applications. A buildable substitute
-- for actual LinkedIn Recruiter integration (which needs a real LinkedIn
-- company account/API access we don't have) — covers the underlying need
-- (attracting co-workers/volunteers) without faking an external integration.

create table public.team_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  contact_email text not null,
  contact_phone text,
  application_type text not null check (application_type in ('volunteer', 'paid_staff')),
  role_interest text,
  message text,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'accepted', 'declined')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.team_applications enable row level security;

create policy "team_applications_anyone_insert"
  on public.team_applications for insert
  with check (applicant_id is null or applicant_id = auth.uid());

create policy "team_applications_owner_or_staff_read"
  on public.team_applications for select
  using (applicant_id = auth.uid() or public.is_staff(auth.uid()));

create policy "team_applications_staff_update"
  on public.team_applications for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
