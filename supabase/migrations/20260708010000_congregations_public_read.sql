-- congregations holds no PII (just service names/periods — the PII lives in
-- congregation_members/attendance_checkins, which stay staff-only). Public
-- read is needed so the church registration form can let visitors pick
-- which congregation they attend.

create policy "congregations_public_read_active"
  on public.congregations for select
  using (is_active);
