-- Shared helpers -------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ---------------------------------------------------------------
-- 1:1 with auth.users. Created automatically via the handle_new_user trigger below.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  role text not null default 'member' check (role in ('member', 'admin', 'committee', 'instructor')),
  locale text not null default 'zh-Hant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth.users, extended with app-specific profile fields and role.';

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- security definer helpers, used across every admin/staff RLS policy in later
-- migrations. security definer means these run with the function owner's
-- privileges (bypassing RLS on profiles), so calling them from a profiles
-- policy does not recurse back into RLS.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create or replace function public.is_staff(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role in ('admin', 'committee', 'instructor')
  );
$$;

create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff(auth.uid()));

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- auto-create a profile row when a new auth user signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- preference_tags ---------------------------------------------------------

create table public.preference_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_zh text not null,
  sort_order int not null default 0
);

alter table public.preference_tags enable row level security;

create policy "preference_tags_public_read"
  on public.preference_tags for select
  using (true);

create policy "preference_tags_admin_write"
  on public.preference_tags for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create table public.profile_preference_tags (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tag_id uuid not null references public.preference_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, tag_id)
);

alter table public.profile_preference_tags enable row level security;

create policy "profile_preference_tags_owner_or_staff_read"
  on public.profile_preference_tags for select
  using (auth.uid() = profile_id or public.is_staff(auth.uid()));

create policy "profile_preference_tags_owner_write"
  on public.profile_preference_tags for insert
  with check (auth.uid() = profile_id);

create policy "profile_preference_tags_owner_delete"
  on public.profile_preference_tags for delete
  using (auth.uid() = profile_id);
