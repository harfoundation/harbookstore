-- Extend team_applications to also capture "中文屬靈書籍書評寫作" sign-ups
-- (the Book Review Committee recruiting writers for the 50-book catalog) —
-- reuses the existing application/review workflow rather than a parallel table.

alter table public.team_applications
  drop constraint team_applications_application_type_check;

alter table public.team_applications
  add constraint team_applications_application_type_check
  check (application_type in ('volunteer', 'paid_staff', 'book_review_writer'));
