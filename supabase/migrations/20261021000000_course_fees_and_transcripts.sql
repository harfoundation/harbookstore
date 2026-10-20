-- Course fee breakdown + multilingual lesson transcripts ---------------------
-- For the HAR church-planting training: each course is priced as
-- 培訓費 + 書費 + 講師費, set by staff. price_cents stays the single amount the
-- existing checkout charges, kept equal to the sum by a trigger whenever any
-- component is set (courses without a breakdown keep their plain price).

alter table public.courses
  add column training_fee_cents int check (training_fee_cents is null or training_fee_cents >= 0),
  add column book_fee_cents int check (book_fee_cents is null or book_fee_cents >= 0),
  add column instructor_fee_cents int check (instructor_fee_cents is null or instructor_fee_cents >= 0);

create or replace function public.courses_sync_price_from_fees()
returns trigger
language plpgsql
as $$
begin
  if new.training_fee_cents is not null
     or new.book_fee_cents is not null
     or new.instructor_fee_cents is not null then
    new.price_cents := coalesce(new.training_fee_cents, 0)
                     + coalesce(new.book_fee_cents, 0)
                     + coalesce(new.instructor_fee_cents, 0);
  end if;
  return new;
end;
$$;

create trigger courses_sync_price_from_fees
  before insert or update on public.courses
  for each row execute function public.courses_sync_price_from_fees();

-- Snapshot of the breakdown at enrolment time, so the books still show what
-- part of a payment was the instructor's fee even if prices change later.
alter table public.order_items
  add column fee_breakdown jsonb;

-- lesson_transcripts: one row per lesson per language. The original (as
-- taught) plus translations prepared ahead of time, so students on a laptop
-- or iPad can read along — or compare two languages side by side — while the
-- recording plays. Simplified Chinese comes free from the site's 繁/简 toggle.

create table public.lesson_transcripts (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  language text not null
    check (language in ('zh-Hant', 'en', 'ko', 'ja', 'vi', 'id', 'ms', 'es', 'fr', 'pt')),
  is_original boolean not null default false,
  content text not null,
  updated_at timestamptz not null default now(),
  primary key (lesson_id, language)
);

alter table public.lesson_transcripts enable row level security;

create trigger set_lesson_transcripts_updated_at
  before update on public.lesson_transcripts
  for each row execute function public.set_updated_at();

create policy "lesson_transcripts_read_with_lesson"
  on public.lesson_transcripts for select
  using (
    exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = lesson_id and l.is_published and c.is_published
    )
    or public.is_staff(auth.uid())
  );

create policy "lesson_transcripts_staff_write"
  on public.lesson_transcripts for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
