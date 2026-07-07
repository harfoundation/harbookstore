-- Some devotional books (e.g. 答非所問) pair a quote-style headline with a
-- one-line thesis statement, distinct from the entry title itself. This
-- mirrors the subtitle column already present on devotional_books.
alter table public.devotional_entries add column subtitle text;
