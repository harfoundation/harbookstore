-- Multi-tenant "church" module — 山書坊 starts hosting other congregations'
-- weekly ministry operations (schedule, worship songs, sermon slides,
-- newcomer/co-worker registration, announcements) on top of the existing
-- platform. Wesley Box Hill (the operator's own church, already using
-- congregations/attendance_* below) becomes the first (internal, unbilled)
-- church; Crossway Boroondara is the first paying customer.
--
-- Billing is invoice-style (bank transfer + manual admin confirmation), same
-- pattern as retail orders — no live payment processing.

create table public.churches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_active boolean not null default true,
  billing_status text not null default 'trial'
    check (billing_status in ('internal', 'trial', 'pending_invoice', 'paid', 'overdue', 'cancelled')),
  billing_plan_cents integer,
  billing_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.churches is 'Tenant/customer churches using the ministry-operations module. billing_status=internal for the operator''s own church (no fee).';

alter table public.churches enable row level security;

create trigger set_churches_updated_at
  before update on public.churches
  for each row execute function public.set_updated_at();

-- Only global Har Foundation staff manage churches (including billing) —
-- a church's own coordinators never see other churches or billing terms.
create policy "churches_staff_all"
  on public.churches for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Public-safe directory (no billing/contact columns) so per-church public
-- pages can resolve a slug without exposing invoicing terms — same pattern
-- as public_answered_questions hiding submitter identity.
create view public.public_church_directory as
select id, slug, name_zh, name_en
from public.churches
where is_active;

grant select on public.public_church_directory to anon, authenticated;

-- church_staff: scopes a profile's admin access to one church, so a
-- Crossway coordinator can manage Crossway's own content without seeing
-- Wesley Box Hill's (or vice versa). Global staff (profiles.role in
-- admin/committee/instructor) can already manage every church via
-- is_staff() and don't need a row here.

create table public.church_staff (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('church_admin', 'editor')),
  created_at timestamptz not null default now(),
  unique (church_id, profile_id)
);

alter table public.church_staff enable row level security;

create policy "church_staff_staff_all"
  on public.church_staff for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "church_staff_select_own"
  on public.church_staff for select
  using (profile_id = auth.uid());

create or replace function public.is_church_staff(uid uuid, target_church_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_staff(uid) or exists (
    select 1 from public.church_staff
    where profile_id = uid and church_id = target_church_id
  );
$$;

-- Seed the operator's own church and backfill it onto the existing
-- congregations/attendance_* tables, which predate multi-tenancy.
insert into public.churches (slug, name_zh, name_en, is_active, billing_status)
values ('wesley-boxhill', '衛斯理伯士山堂', 'Wesley Uniting Church Box Hill', true, 'internal');

alter table public.congregations
  add column church_id uuid references public.churches(id) on delete cascade;

update public.congregations
  set church_id = (select id from public.churches where slug = 'wesley-boxhill')
  where church_id is null;

alter table public.congregations
  alter column church_id set not null;

create index congregations_church_id_idx on public.congregations (church_id);

drop policy "congregations_staff_all" on public.congregations;
create policy "congregations_church_staff_all"
  on public.congregations for all
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

drop policy "congregation_members_staff_all" on public.congregation_members;
create policy "congregation_members_church_staff_all"
  on public.congregation_members for all
  using (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations where id = congregation_id
  )))
  with check (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations where id = congregation_id
  )));

drop policy "attendance_sessions_staff_all" on public.attendance_sessions;
create policy "attendance_sessions_church_staff_all"
  on public.attendance_sessions for all
  using (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations where id = congregation_id
  )))
  with check (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations where id = congregation_id
  )));

drop policy "attendance_checkins_staff_all" on public.attendance_checkins;
create policy "attendance_checkins_church_staff_all"
  on public.attendance_checkins for all
  using (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations c
    join public.attendance_sessions s on s.congregation_id = c.id
    where s.id = session_id
  )))
  with check (public.is_church_staff(auth.uid(), (
    select church_id from public.congregations c
    join public.attendance_sessions s on s.congregation_id = c.id
    where s.id = session_id
  )));

-- church_services: the recurring weekly-operations schedule (daily
-- devotion, biweekly bible study, prayer meetings, fellowship, Sunday
-- services, etc). schedule_label is deliberately free text — recurrence
-- here is informational (tells staff when to expect to upload materials),
-- not a cron engine.

create table public.church_services (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name_zh text not null,
  schedule_label text not null,
  day_of_week int check (day_of_week between 0 and 6),
  language text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index church_services_church_id_idx on public.church_services (church_id);

alter table public.church_services enable row level security;

create policy "church_services_public_read"
  on public.church_services for select
  using (is_active or public.is_church_staff(auth.uid(), church_id));

create policy "church_services_church_staff_write"
  on public.church_services for insert
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "church_services_church_staff_update"
  on public.church_services for update
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "church_services_church_staff_delete"
  on public.church_services for delete
  using (public.is_church_staff(auth.uid(), church_id));

-- worship_songs: a per-church reusable song library (upload/management
-- only — no chord charts, transposition, or auto slide layout).

create table public.worship_songs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  lyrics_markdown text,
  file_url text,
  created_at timestamptz not null default now()
);

create index worship_songs_church_id_idx on public.worship_songs (church_id);

alter table public.worship_songs enable row level security;

create policy "worship_songs_public_read"
  on public.worship_songs for select
  using (true);

create policy "worship_songs_church_staff_write"
  on public.worship_songs for insert
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "worship_songs_church_staff_update"
  on public.worship_songs for update
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "worship_songs_church_staff_delete"
  on public.worship_songs for delete
  using (public.is_church_staff(auth.uid(), church_id));

-- service_materials: one specific week's instance of a church_service —
-- the sermon slides + song set actually used that day.

create table public.service_materials (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  service_id uuid not null references public.church_services(id) on delete cascade,
  service_date date not null,
  sermon_title text,
  sermon_speaker text,
  sermon_ppt_url text,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, service_date)
);

create index service_materials_church_id_idx on public.service_materials (church_id);
create index service_materials_service_date_idx on public.service_materials (service_date);

alter table public.service_materials enable row level security;

create trigger set_service_materials_updated_at
  before update on public.service_materials
  for each row execute function public.set_updated_at();

create policy "service_materials_public_read_published"
  on public.service_materials for select
  using (status = 'published' or public.is_church_staff(auth.uid(), church_id));

create policy "service_materials_church_staff_write"
  on public.service_materials for insert
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "service_materials_church_staff_update"
  on public.service_materials for update
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "service_materials_church_staff_delete"
  on public.service_materials for delete
  using (public.is_church_staff(auth.uid(), church_id));

create table public.service_material_songs (
  service_material_id uuid not null references public.service_materials(id) on delete cascade,
  worship_song_id uuid not null references public.worship_songs(id) on delete cascade,
  sort_order int not null default 0,
  primary key (service_material_id, worship_song_id)
);

alter table public.service_material_songs enable row level security;

create policy "service_material_songs_public_read"
  on public.service_material_songs for select
  using (exists (
    select 1 from public.service_materials m
    where m.id = service_material_id
      and (m.status = 'published' or public.is_church_staff(auth.uid(), m.church_id))
  ));

create policy "service_material_songs_church_staff_write"
  on public.service_material_songs for all
  using (public.is_church_staff(auth.uid(), (
    select church_id from public.service_materials where id = service_material_id
  )))
  with check (public.is_church_staff(auth.uid(), (
    select church_id from public.service_materials where id = service_material_id
  )));

-- church_registrations: newcomer (新朋友) / co-worker (同工) sign-up form.
-- Public insert-only (anyone can submit, including anonymous visitors —
-- no login required), staff-only read, mirroring team_applications.

create table public.church_registrations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  registration_type text not null check (registration_type in ('newcomer', 'co_worker')),
  full_name text not null,
  phone text,
  email text,
  congregation_id uuid references public.congregations(id) on delete set null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'archived')),
  created_at timestamptz not null default now()
);

create index church_registrations_church_id_idx on public.church_registrations (church_id);

alter table public.church_registrations enable row level security;

create policy "church_registrations_public_insert"
  on public.church_registrations for insert
  with check (true);

create policy "church_registrations_church_staff_manage"
  on public.church_registrations for all
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

-- church_announcements: per-church notices (separate from the platform-wide
-- public "events" bulletin board).

create table public.church_announcements (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  body_markdown text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index church_announcements_church_id_idx on public.church_announcements (church_id);

alter table public.church_announcements enable row level security;

create trigger set_church_announcements_updated_at
  before update on public.church_announcements
  for each row execute function public.set_updated_at();

create policy "church_announcements_public_read_published"
  on public.church_announcements for select
  using (status = 'published' or public.is_church_staff(auth.uid(), church_id));

create policy "church_announcements_church_staff_write"
  on public.church_announcements for insert
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "church_announcements_church_staff_update"
  on public.church_announcements for update
  using (public.is_church_staff(auth.uid(), church_id))
  with check (public.is_church_staff(auth.uid(), church_id));

create policy "church_announcements_church_staff_delete"
  on public.church_announcements for delete
  using (public.is_church_staff(auth.uid(), church_id));
