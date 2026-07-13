-- book-covers storage bucket ------------------------------------------------
-- For admin-uploaded/scanned book cover images (e.g. when no usable cover
-- exists online) — public read, staff-only write.

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

create policy "book_covers_public_read"
  on storage.objects for select
  using (bucket_id = 'book-covers');

create policy "book_covers_staff_write"
  on storage.objects for insert
  with check (bucket_id = 'book-covers' and public.is_staff(auth.uid()));

create policy "book_covers_staff_update"
  on storage.objects for update
  using (bucket_id = 'book-covers' and public.is_staff(auth.uid()))
  with check (bucket_id = 'book-covers' and public.is_staff(auth.uid()));

create policy "book_covers_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'book-covers' and public.is_staff(auth.uid()));
