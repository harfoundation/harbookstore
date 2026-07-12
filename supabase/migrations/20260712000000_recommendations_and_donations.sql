-- member_referrals ---------------------------------------------------------
-- A member recommending a friend to join Har Book Club (not a book
-- recommendation). The actual invite happens via a WhatsApp share-out link
-- (this community runs on WhatsApp); this table just records that it
-- happened so staff can follow up and see referral activity.

create table public.member_referrals (
  id uuid primary key default gen_random_uuid(),
  referred_by uuid not null references public.profiles(id) on delete cascade,
  referred_name text not null,
  referred_contact text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'joined', 'declined')),
  created_at timestamptz not null default now()
);

create index member_referrals_referred_by_idx on public.member_referrals (referred_by);

alter table public.member_referrals enable row level security;

create policy "member_referrals_owner_or_staff_read"
  on public.member_referrals for select
  using (auth.uid() = referred_by or public.is_staff(auth.uid()));

create policy "member_referrals_owner_insert"
  on public.member_referrals for insert
  with check (auth.uid() = referred_by);

create policy "member_referrals_staff_update"
  on public.member_referrals for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

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

-- membership_fee_settings ---------------------------------------------------
-- A single editable row: the current membership registration fee and a
-- public-facing note on what it's used for. Staff-editable, publicly
-- readable (transparency).

create table public.membership_fee_settings (
  id boolean primary key default true check (id),
  fee_cents int check (fee_cents is null or fee_cents >= 0),
  currency text not null default 'AUD',
  usage_note text,
  updated_at timestamptz not null default now()
);

insert into public.membership_fee_settings (id, fee_cents, usage_note) values (true, null, null);

alter table public.membership_fee_settings enable row level security;

create trigger set_membership_fee_settings_updated_at
  before update on public.membership_fee_settings
  for each row execute function public.set_updated_at();

create policy "membership_fee_settings_public_read"
  on public.membership_fee_settings for select
  using (true);

create policy "membership_fee_settings_staff_update"
  on public.membership_fee_settings for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- membership_registrations --------------------------------------------------
-- A member's registration-fee payment intent — same no-live-payment pattern
-- as donations/orders: snapshot the fee at submission time, staff manually
-- confirm receipt.

create sequence public.membership_registration_number_seq;

create table public.membership_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique
    default ('MB-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.membership_registration_number_seq')::text, 4, '0')),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  fee_cents int check (fee_cents is null or fee_cents >= 0),
  currency text not null default 'AUD',
  payment_method text not null default 'to_be_arranged'
    check (payment_method in ('bank_transfer', 'in_person', 'to_be_arranged')),
  payment_received_at timestamptz,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.membership_registrations enable row level security;

create trigger set_membership_registrations_updated_at
  before update on public.membership_registrations
  for each row execute function public.set_updated_at();

create policy "membership_registrations_owner_or_staff_read"
  on public.membership_registrations for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "membership_registrations_owner_insert"
  on public.membership_registrations for insert
  with check (auth.uid() = profile_id);

create policy "membership_registrations_staff_update"
  on public.membership_registrations for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
