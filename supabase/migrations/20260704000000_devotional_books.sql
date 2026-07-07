-- Devotional book module: a reusable content model for authored daily-
-- devotional collections (not hardcoded to any one title), covering the
-- 傳道心聲/Pastoral Voice import and any future books written the same way.
-- Entries are ordered by entry_number (chronological writing order); a
-- written_date field is left nullable for books where real calendar dates
-- are known.

create table public.devotional_books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_zh text not null,
  title_en text,
  subtitle text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  author_bio_markdown text,
  declaration_markdown text,
  preface_markdown text,
  afterword_markdown text,
  topic_index text[] not null default '{}',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.devotional_books enable row level security;

create trigger set_devotional_books_updated_at
  before update on public.devotional_books
  for each row execute function public.set_updated_at();

create policy "devotional_books_public_read_published"
  on public.devotional_books for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "devotional_books_staff_write"
  on public.devotional_books for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- devotional_volumes ----------------------------------------------------

create table public.devotional_volumes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.devotional_books(id) on delete cascade,
  volume_number int not null,
  title_zh text not null,
  subtitle_zh text,
  intro_markdown text,
  sort_order int not null default 0,
  unique (book_id, volume_number)
);

create index devotional_volumes_book_id_idx on public.devotional_volumes (book_id);

alter table public.devotional_volumes enable row level security;

create policy "devotional_volumes_public_read_published_book"
  on public.devotional_volumes for select
  using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.devotional_books b
      where b.id = book_id and b.status = 'published'
    )
  );

create policy "devotional_volumes_staff_write"
  on public.devotional_volumes for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- devotional_entries -------------------------------------------------------

create table public.devotional_entries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.devotional_books(id) on delete cascade,
  volume_id uuid not null references public.devotional_volumes(id) on delete cascade,
  entry_number int not null,
  title text not null,
  body_markdown text not null,
  scripture_reference text,
  written_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, entry_number)
);

create index devotional_entries_book_id_idx on public.devotional_entries (book_id);
create index devotional_entries_volume_id_idx on public.devotional_entries (volume_id);

alter table public.devotional_entries enable row level security;

create trigger set_devotional_entries_updated_at
  before update on public.devotional_entries
  for each row execute function public.set_updated_at();

create policy "devotional_entries_public_read_published"
  on public.devotional_entries for select
  using (
    public.is_staff(auth.uid())
    or (
      status = 'published'
      and exists (
        select 1 from public.devotional_books b
        where b.id = book_id and b.status = 'published'
      )
    )
  );

create policy "devotional_entries_staff_write"
  on public.devotional_entries for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
