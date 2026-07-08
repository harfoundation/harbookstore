-- Reading shares (讀書會/閱讀分享錄入) — WhatsApp Community/Group discussion
-- is unstructured and good shares get lost in the scroll. There's no
-- legitimate way to auto-ingest Community/Group messages (WhatsApp's
-- Business API only supports 1:1 conversations with the business's own
-- number, never Community/Group monitoring — same constraint noted in
-- whatsapp_contacts), so this is manual capture: a registered member
-- copies a good share from WhatsApp into a structured, searchable, book-
-- linked record. "Backup" in the other direction is just a wa.me share
-- link (client-side only) so a saved entry can be reposted to WhatsApp.

create table public.reading_shares (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  shared_by_name text,
  source_group text,
  quote_text text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index reading_shares_book_id_idx on public.reading_shares (book_id);
create index reading_shares_created_at_idx on public.reading_shares (created_at desc);

alter table public.reading_shares enable row level security;

create policy "reading_shares_public_read"
  on public.reading_shares for select
  using (not is_hidden or public.is_staff(auth.uid()));

create policy "reading_shares_authenticated_insert"
  on public.reading_shares for insert
  with check (auth.uid() = submitted_by);

create policy "reading_shares_owner_or_staff_delete"
  on public.reading_shares for delete
  using (auth.uid() = submitted_by or public.is_staff(auth.uid()));

create policy "reading_shares_staff_update"
  on public.reading_shares for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
