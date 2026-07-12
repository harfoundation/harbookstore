-- book_recommendations ---------------------------------------------------
-- Member-to-member "I recommend this to a friend" — the actual send happens
-- via a WhatsApp share-out link (this community runs on WhatsApp), this
-- table just records that it happened so we can show a recommend count.

create table public.book_recommendations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  recommended_by uuid not null references public.profiles(id) on delete cascade,
  recipient_name text,
  message text,
  created_at timestamptz not null default now()
);

create index book_recommendations_book_id_idx on public.book_recommendations (book_id);

alter table public.book_recommendations enable row level security;

create policy "book_recommendations_owner_or_staff_read"
  on public.book_recommendations for select
  using (auth.uid() = recommended_by or public.is_staff(auth.uid()));

create policy "book_recommendations_owner_insert"
  on public.book_recommendations for insert
  with check (auth.uid() = recommended_by);

-- Public-safe aggregate: recommend counts per book, no personal data exposed.
create view public.book_recommendation_counts as
  select book_id, count(*) as recommend_count
  from public.book_recommendations
  group by book_id;

grant select on public.book_recommendation_counts to anon, authenticated;

-- donation_pledges ---------------------------------------------------------
-- Fundraising for the ministry's general operations (not tied to a specific
-- book/order). Same no-live-payment pattern as orders: donor states intent,
-- sees bank-transfer details, staff manually confirms receipt.

create sequence public.donation_pledge_number_seq;

create table public.donation_pledges (
  id uuid primary key default gen_random_uuid(),
  pledge_number text not null unique
    default ('DN-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.donation_pledge_number_seq')::text, 4, '0')),
  donor_id uuid references public.profiles(id) on delete set null,
  donor_name text not null,
  donor_email text,
  donor_phone text,
  amount_cents int check (amount_cents is null or amount_cents >= 0),
  currency text not null default 'AUD',
  purpose_note text,
  payment_method text not null default 'to_be_arranged'
    check (payment_method in ('bank_transfer', 'in_person', 'to_be_arranged')),
  payment_received_at timestamptz,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donation_pledges enable row level security;

create trigger set_donation_pledges_updated_at
  before update on public.donation_pledges
  for each row execute function public.set_updated_at();

create policy "donation_pledges_owner_or_staff_read"
  on public.donation_pledges for select
  using (auth.uid() = donor_id or public.is_staff(auth.uid()));

-- Anonymous donors are allowed (no forced signup to give) — donor_id is only
-- set when the submitter happens to be logged in.
create policy "donation_pledges_insert"
  on public.donation_pledges for insert
  with check (donor_id is null or auth.uid() = donor_id);

create policy "donation_pledges_staff_update"
  on public.donation_pledges for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
