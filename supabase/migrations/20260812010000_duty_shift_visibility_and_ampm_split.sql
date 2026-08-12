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

-- Switch from a single fixed 10am-5pm slot to separate morning (10-1) and
-- afternoon (1-5) slots per day, per volunteer availability collected over
-- WhatsApp. Drop the future, still-unclaimed all-day rows so the app's
-- self-service generator (now producing two half-day slots per date)
-- replaces them on next load. Rows that are already claimed are left
-- untouched so no one's existing sign-up is disrupted.
delete from public.duty_shifts
where shift_date >= current_date
  and start_time = '10:00:00'
  and end_time = '17:00:00'
  and assigned_profile_id is null;
