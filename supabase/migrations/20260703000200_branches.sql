-- Physical branch/pickup locations. Starts with a single default branch
-- (Box Hill, VIC) — more branches are added by admin as the ministry grows.

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  city text not null,
  suburb text not null,
  address text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Only one default branch at a time.
create unique index branches_single_default_idx on public.branches (is_default) where is_default;

alter table public.branches enable row level security;

create policy "branches_public_read_active"
  on public.branches for select
  using (is_active or public.is_staff(auth.uid()));

create policy "branches_admin_write"
  on public.branches for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.branches (state, city, suburb, address, is_default, sort_order) values
  ('VIC', 'Melbourne', 'Box Hill', '2–6 Oxford Street, (Wesley Uniting Church Box Hill), Box Hill, VIC 3128', true, 1);

-- Optional pickup-branch reference on orders/borrow_requests (self_pickup /
-- in_person only — nullable, no behavior change for mail/digital deliveries).

alter table public.orders
  add column branch_id uuid references public.branches(id) on delete set null;

alter table public.borrow_requests
  add column branch_id uuid references public.branches(id) on delete set null;
