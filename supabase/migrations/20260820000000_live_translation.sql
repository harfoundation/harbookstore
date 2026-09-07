-- Live speech translation for Sunday Bible study: a staff member runs a
-- "speak" session (browser speech recognition transcribes their voice
-- client-side, free), each finalized phrase gets machine-translated and
-- inserted here, and listeners subscribe to this table via Supabase
-- Realtime and speak each new caption aloud with their own browser's
-- speech synthesis (also free, runs on their own device). No audio is
-- ever uploaded or streamed between users — only short text captions.

create table public.translation_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_lang text not null,
  target_lang text not null,
  status text not null default 'active' check (status in ('active', 'ended')),
  created_by uuid references public.profiles(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index translation_sessions_status_idx on public.translation_sessions (status);

alter table public.translation_sessions enable row level security;

create policy "translation_sessions_authenticated_read"
  on public.translation_sessions for select
  using (auth.uid() is not null);

create policy "translation_sessions_staff_write"
  on public.translation_sessions for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create table public.translation_captions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.translation_sessions(id) on delete cascade,
  source_text text not null,
  translated_text text not null,
  created_at timestamptz not null default now()
);

create index translation_captions_session_id_idx on public.translation_captions (session_id, created_at);

alter table public.translation_captions enable row level security;

-- Not auth.uid()-gated on purpose: Supabase Realtime's postgres_changes
-- feed evaluates row visibility using the anon role (confirmed empirically
-- against the local stack — auth.uid() and even a "to authenticated"-scoped
-- policy both silently block delivery, since Realtime's WAL-listening
-- connection never has the subscriber's JWT claims available to it). Actual
-- access control for this feature happens at the page level (the listener
-- page redirects to /login if not signed in) — captions are low-sensitivity
-- (public sermon/study content), so an open read policy here is an
-- acceptable tradeoff to make realtime delivery work at all.
create policy "translation_captions_read"
  on public.translation_captions for select
  using (true);

create policy "translation_captions_staff_insert"
  on public.translation_captions for insert
  with check (public.is_staff(auth.uid()));

-- Required for listeners to receive new captions live — Supabase only
-- broadcasts postgres_changes for tables explicitly in this publication.
alter publication supabase_realtime add table public.translation_captions;
