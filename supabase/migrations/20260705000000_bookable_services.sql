-- Offline bookable services: the co-op/共享工作空間+cafe at a branch, plus any
-- other reservable service (counselling slot, venue hire, etc). This is a
-- free reservation system (no payment) — distinct from the paid
-- course_enrollment order flow already covering courses/workshops/diplomas.

create table public.bookable_services (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  description text,
  category text not null default 'other'
    check (category in ('cafe_coop', 'consultation', 'venue_hire', 'other')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index bookable_services_branch_id_idx on public.bookable_services (branch_id);

alter table public.bookable_services enable row level security;

create policy "bookable_services_public_read_active"
  on public.bookable_services for select
  using (is_active or public.is_staff(auth.uid()));

create policy "bookable_services_staff_write"
  on public.bookable_services for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

insert into public.bookable_services (branch_id, name, description, category, sort_order)
select id, 'Co-op 共享工作空間 + Cafe', '按時段預約座位，歡迎自習、小組討論或單純喝杯咖啡。', 'cafe_coop', 1
from public.branches where is_default;

-- service_bookings ---------------------------------------------------------

create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.bookable_services(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  party_size int check (party_size is null or party_size > 0),
  preferred_date date not null,
  preferred_time text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  admin_reply_message text,
  responded_by uuid references public.profiles(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_bookings_service_id_idx on public.service_bookings (service_id);
create index service_bookings_status_idx on public.service_bookings (status);

alter table public.service_bookings enable row level security;

create trigger set_service_bookings_updated_at
  before update on public.service_bookings
  for each row execute function public.set_updated_at();

create policy "service_bookings_owner_or_staff_read"
  on public.service_bookings for select
  using (auth.uid() = customer_id or public.is_staff(auth.uid()));

create policy "service_bookings_anyone_insert"
  on public.service_bookings for insert
  with check (customer_id is null or customer_id = auth.uid());

create policy "service_bookings_staff_update"
  on public.service_bookings for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
