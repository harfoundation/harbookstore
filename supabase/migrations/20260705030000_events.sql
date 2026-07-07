-- Event announcements (活動公告) — ad-hoc posts for one-off events like a
-- church dedication service, outreach, or special gathering. Deliberately
-- simple/free-form (no RSVP or capacity tracking) since that's already
-- covered by the bookable_services reservation system for recurring
-- offerings; this is just a public bulletin-board style announcement.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  body_markdown text,
  event_date date not null,
  event_time text,
  location text,
  poster_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_event_date_idx on public.events (event_date);
create index events_status_idx on public.events (status);

alter table public.events enable row level security;

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create policy "events_public_read_published"
  on public.events for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "events_staff_write"
  on public.events for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
