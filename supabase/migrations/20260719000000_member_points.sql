-- Internal member recognition points — NOT a currency, NOT blockchain-based,
-- NOT redeemable for cash or goods, NOT transferable between members. Purely
-- an append-only activity ledger used to recognise engagement (donations,
-- membership, referrals, borrowing). No monetary value attaches to a point.

create table public.member_points_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points int not null,
  reason text not null
    check (reason in ('donation', 'membership', 'referral', 'borrow_returned', 'admin_adjustment')),
  note text,
  awarded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index member_points_ledger_profile_id_idx on public.member_points_ledger (profile_id);

alter table public.member_points_ledger enable row level security;

create policy "member_points_ledger_owner_or_staff_read"
  on public.member_points_ledger for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "member_points_ledger_staff_insert"
  on public.member_points_ledger for insert
  with check (public.is_staff(auth.uid()));

-- Public leaderboard view: total points per member, no PII beyond display name.
create view public.member_points_totals as
select
  p.id as profile_id,
  p.display_name,
  coalesce(sum(l.points), 0) as total_points
from public.profiles p
left join public.member_points_ledger l on l.profile_id = p.id
group by p.id, p.display_name;
