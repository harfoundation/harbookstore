-- AI 神學導師 (AI theology tutor) -------------------------------------------------
-- Public tier of the 「AI＋神學教育」 project. Only public-domain / licensed /
-- self-authored teaching texts belong in this library — sensitive pastoral
-- material stays on the internal laptop and must never be imported here.

-- theology_sources: one row per imported text (a Bible translation, a book, lecture notes)

create table public.theology_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  kind text not null check (kind in ('bible', 'book', 'lecture')),
  license text not null check (license in ('public_domain', 'licensed', 'own_work')),
  license_note text,
  language text not null default 'zh',
  -- which HAR Community knowledge base this belongs to: theology study first,
  -- then 讀書會 reading guides (phase 2) — one platform, one login for all groups.
  collection text not null default 'theology' check (collection in ('theology', 'book_club')),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.theology_sources enable row level security;

create policy "theology_sources_staff_all"
  on public.theology_sources for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- theology_chunks: retrievable passages. For Bible sources book/chapter/verse
-- are set (one row per verse); for books, ref_label carries the chapter/section.

create table public.theology_chunks (
  id bigint generated always as identity primary key,
  source_id uuid not null references public.theology_sources(id) on delete cascade,
  ordinal int not null,
  ref_label text not null,
  book text,
  chapter int,
  verse int,
  content text not null
);

create index theology_chunks_source_ordinal_idx on public.theology_chunks (source_id, ordinal);
create index theology_chunks_bible_ref_idx on public.theology_chunks (book, chapter, verse);

alter table public.theology_chunks enable row level security;

create policy "theology_chunks_staff_all"
  on public.theology_chunks for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Keyword retrieval: scores each chunk by how many of the given terms it
-- contains. Chinese has no word boundaries, so the caller (Claude) supplies
-- short keywords/phrases rather than relying on Postgres full-text parsing.
-- Swap for pgvector embeddings once the library outgrows this.

create or replace function public.search_theology_chunks(
  terms text[],
  max_results int default 12,
  only_kind text default null
)
returns table (
  id bigint,
  source_title text,
  source_author text,
  ref_label text,
  content text,
  score int
)
language sql
stable
as $$
  select c.id, s.title, s.author, c.ref_label, c.content, m.score
  from public.theology_chunks c
  join public.theology_sources s on s.id = c.source_id
  cross join lateral (
    select count(*)::int as score
    from unnest(terms) t
    where length(t) > 0 and strpos(c.content, t) > 0
  ) m
  where s.is_published
    and (only_kind is null or s.kind = only_kind)
    and m.score > 0
  order by m.score desc, s.title, c.ordinal
  limit least(max_results, 30);
$$;

revoke execute on function public.search_theology_chunks(text[], int, text) from public, anon, authenticated;

-- ai_tutor_members: invite-only access during the pilot. A separate table
-- (not a profiles column) because profiles rows are self-updatable.

create table public.ai_tutor_members (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.ai_tutor_members enable row level security;

create policy "ai_tutor_members_self_or_staff_read"
  on public.ai_tutor_members for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "ai_tutor_members_staff_write"
  on public.ai_tutor_members for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- conversations + messages ------------------------------------------------------

create table public.ai_tutor_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index ai_tutor_conversations_profile_idx on public.ai_tutor_conversations (profile_id, created_at desc);

alter table public.ai_tutor_conversations enable row level security;

create policy "ai_tutor_conversations_owner_or_staff_read"
  on public.ai_tutor_conversations for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "ai_tutor_conversations_owner_insert"
  on public.ai_tutor_conversations for insert
  with check (auth.uid() = profile_id);

create table public.ai_tutor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_tutor_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  -- retrieved passages shown under the answer: [{id, source_title, ref_label}]
  sources jsonb not null default '[]'::jsonb,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'needs_correction')),
  reviewer_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);

create index ai_tutor_messages_conversation_idx on public.ai_tutor_messages (conversation_id, created_at);
create index ai_tutor_messages_review_idx on public.ai_tutor_messages (role, review_status, created_at desc);

alter table public.ai_tutor_messages enable row level security;

create policy "ai_tutor_messages_owner_or_staff_read"
  on public.ai_tutor_messages for select
  using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.ai_tutor_conversations c
      where c.id = conversation_id and c.profile_id = auth.uid()
    )
  );

-- Messages are written server-side with the service role (assistant replies
-- and token counts must not be forgeable); staff update review fields.
create policy "ai_tutor_messages_staff_update"
  on public.ai_tutor_messages for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Staff grant access by e-mail (profiles has no email column; auth.users does).
create or replace function public.ai_tutor_grant_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if not public.is_staff(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select u.id into v_profile_id
  from auth.users u
  where lower(u.email) = lower(trim(p_email));

  if v_profile_id is null then
    return null;
  end if;

  insert into public.ai_tutor_members (profile_id, granted_by)
  values (v_profile_id, auth.uid())
  on conflict (profile_id) do nothing;

  return v_profile_id;
end;
$$;

revoke execute on function public.ai_tutor_grant_by_email(text) from public, anon;
grant execute on function public.ai_tutor_grant_by_email(text) to authenticated;
