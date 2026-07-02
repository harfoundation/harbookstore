-- courses -----------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  instructor_name text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "courses_public_read_published"
  on public.courses for select
  using (is_published or public.is_staff(auth.uid()));

create policy "courses_staff_write"
  on public.courses for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- lessons -------------------------------------------------------------------
-- video_url points at an external embed (YouTube/Vimeo) — no self-hosted video.

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  video_url text,
  duration_seconds int,
  sort_order int not null default 0,
  is_published boolean not null default false
);

create index lessons_course_id_idx on public.lessons (course_id);

alter table public.lessons enable row level security;

create policy "lessons_public_read_published"
  on public.lessons for select
  using (
    (is_published and exists (select 1 from public.courses c where c.id = course_id and c.is_published))
    or public.is_staff(auth.uid())
  );

create policy "lessons_staff_write"
  on public.lessons for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- course_progress -------------------------------------------------------------

create table public.course_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profile_id, lesson_id)
);

alter table public.course_progress enable row level security;

create trigger set_course_progress_updated_at
  before update on public.course_progress
  for each row execute function public.set_updated_at();

create policy "course_progress_owner_read"
  on public.course_progress for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "course_progress_owner_write"
  on public.course_progress for insert
  with check (auth.uid() = profile_id);

create policy "course_progress_owner_update"
  on public.course_progress for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- course_qa (讲师在线答疑墙) ----------------------------------------------------

create table public.course_qa (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.course_qa(id) on delete cascade,
  body text not null,
  is_instructor_reply boolean not null default false,
  created_at timestamptz not null default now()
);

create index course_qa_course_id_idx on public.course_qa (course_id);
create index course_qa_parent_id_idx on public.course_qa (parent_id);

alter table public.course_qa enable row level security;

create policy "course_qa_read_on_published_course"
  on public.course_qa for select
  using (
    exists (select 1 from public.courses c where c.id = course_id and c.is_published)
    or public.is_staff(auth.uid())
  );

create policy "course_qa_authenticated_insert"
  on public.course_qa for insert
  with check (auth.uid() = author_id);

create policy "course_qa_author_or_admin_delete"
  on public.course_qa for delete
  using (auth.uid() = author_id or public.is_admin(auth.uid()));
