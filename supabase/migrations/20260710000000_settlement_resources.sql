-- Settlement resources (移民安家) — practical guidance for newly-arrived
-- Chinese migrants and second-generation families settling in Australia:
-- housing, starting a business, and study/employment. Open to believers
-- and non-believers alike (matches HAR Foundation's actual public charter
-- of advancing social welfare for newly arrived migrants generally, not a
-- church-members-only benefit) — bilingual zh/en since this is squarely
-- aimed at people who may not read Chinese fluently yet (or at all).

create table public.settlement_resources (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('housing', 'business', 'employment_study')),
  title_zh text not null,
  title_en text not null,
  body_markdown_zh text not null,
  body_markdown_en text not null,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index settlement_resources_category_idx on public.settlement_resources (category);

alter table public.settlement_resources enable row level security;

create trigger set_settlement_resources_updated_at
  before update on public.settlement_resources
  for each row execute function public.set_updated_at();

create policy "settlement_resources_public_read_published"
  on public.settlement_resources for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "settlement_resources_staff_write"
  on public.settlement_resources for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
