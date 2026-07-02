-- book_categories ----------------------------------------------------------
-- The 9 poster themes: 起步/人物/教会/天国/更新/门训/职场/整合/补全

create table public.book_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_zh text not null,
  subtitle_zh text,
  sort_order int not null default 0,
  cover_image_url text
);

alter table public.book_categories enable row level security;

create policy "book_categories_public_read"
  on public.book_categories for select
  using (true);

create policy "book_categories_admin_write"
  on public.book_categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- books ----------------------------------------------------------------------

create table public.books (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.book_categories(id) on delete set null,
  poster_number int unique,
  title text not null,
  author text,
  translator text,
  isbn text,
  description text,
  cover_image_url text,
  price_cents int check (price_cents is null or price_cents >= 0),
  currency text not null default 'AUD',
  procurement_status text not null default 'available'
    check (procurement_status in ('available', 'preorder', 'out_of_stock', 'discontinued')),
  stock_qty int not null default 0,
  is_lendable boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index books_category_id_idx on public.books (category_id);
create index books_is_active_idx on public.books (is_active) where is_active;

alter table public.books enable row level security;

create trigger set_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create policy "books_public_read_active"
  on public.books for select
  using (is_active or public.is_staff(auth.uid()));

create policy "books_admin_write"
  on public.books for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- wishlists (心愿单) -----------------------------------------------------------

create table public.wishlists (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, book_id)
);

alter table public.wishlists enable row level security;

create policy "wishlists_owner_read"
  on public.wishlists for select
  using (auth.uid() = profile_id);

create policy "wishlists_owner_insert"
  on public.wishlists for insert
  with check (auth.uid() = profile_id);

create policy "wishlists_owner_delete"
  on public.wishlists for delete
  using (auth.uid() = profile_id);
