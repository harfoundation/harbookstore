-- The existing "profiles_select_own_or_staff" policy means a non-staff
-- member can only read their own profile row, so the duty roster's
-- "已由 XXX 認領" (claimed by XXX) label was invisible to other non-staff
-- members — the joined profiles(display_name) came back null for anyone
-- other than themselves. Add a narrow policy that lets any authenticated
-- user read the profile of whoever currently holds an upcoming duty shift,
-- since that's the whole point of a shared, self-service duty roster.
create policy "profiles_select_duty_shift_assignee"
  on public.profiles for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.duty_shifts
      where duty_shifts.assigned_profile_id = profiles.id
    )
  );

-- Switch from a single fixed 10am-5pm slot to one row per hour, so members
-- can claim just the hours they're actually free (per volunteer availability
-- collected over WhatsApp — 10-1, 1-5, 2-5, 3-5 etc all now compose from
-- contiguous hourly claims). Drop future, still-unclaimed rows that aren't
-- exactly an hour long — this covers both the original all-day rows and any
-- half-day rows an earlier deploy of this feature may have already
-- generated. Rows that are already claimed are left untouched so no one's
-- existing sign-up is disrupted.
delete from public.duty_shifts
where shift_date >= current_date
  and assigned_profile_id is null
  and end_time - start_time <> interval '1 hour';
