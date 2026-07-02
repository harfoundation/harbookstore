-- articles (书评委员会专栏) ---------------------------------------------------

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text unique not null,
  body_markdown text not null,
  cover_image_url text,
  related_book_id uuid references public.books(id) on delete set null,
  related_category_id uuid references public.book_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status);
create index articles_related_category_id_idx on public.articles (related_category_id);

alter table public.articles enable row level security;

create policy "articles_public_read_published"
  on public.articles for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "articles_staff_write"
  on public.articles for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- reader_questions (人生解惑提问箱) -------------------------------------------
-- Public can only INSERT (submit a question), never SELECT — this table holds
-- submitter identity/PII. A separate view below is the only public-read surface.

create table public.reader_questions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references public.profiles(id) on delete set null,
  submitter_display_name text,
  question_body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'answered_private', 'answered_public', 'declined')),
  is_anonymous boolean not null default true,
  admin_response_body text,
  responded_by uuid references public.profiles(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reader_questions enable row level security;

create policy "reader_questions_submitter_or_staff_read"
  on public.reader_questions for select
  using (auth.uid() = submitter_id or public.is_staff(auth.uid()));

create policy "reader_questions_anyone_insert"
  on public.reader_questions for insert
  with check (submitter_id is null or submitter_id = auth.uid());

create policy "reader_questions_staff_update"
  on public.reader_questions for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Public, PII-free surface for the community Q&A page.
-- Deliberately NOT security_invoker: this view runs as its owner (the
-- migration role), which is exempt from reader_questions' RLS by table-owner
-- default, so it can expose the answered_public subset to anon/authenticated
-- even though the base table itself is locked to submitter-or-staff only.
create view public.public_answered_questions
as
select id, question_body, admin_response_body, responded_at, created_at
from public.reader_questions
where status = 'answered_public';

grant select on public.public_answered_questions to anon, authenticated;
