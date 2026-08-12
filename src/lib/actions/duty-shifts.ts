"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

export async function claimDutyShift(shiftId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { data, error } = await supabase
    .from("duty_shifts")
    .update({ assigned_profile_id: user.id })
    .eq("id", shiftId)
    .is("assigned_profile_id", null)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "此班次已被認領，請重新整理" };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}

export async function releaseDutyShift(shiftId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { error } = await supabase
    .from("duty_shifts")
    .update({ assigned_profile_id: null })
    .eq("id", shiftId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}

export async function adminAssignDutyShift(
  shiftId: string,
  profileId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("duty_shifts")
    .update({ assigned_profile_id: profileId })
    .eq("id", shiftId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}

export async function deleteDutyShift(shiftId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("duty_shifts").delete().eq("id", shiftId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}

const DUTY_DAYS = [2, 3, 4]; // Tue, Wed, Thu
const DUTY_SLOTS = [
  { start: "10:00:00", end: "13:00:00" },
  { start: "13:00:00", end: "17:00:00" },
];

function buildUpcomingDutyDates(weeks: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (DUTY_DAYS.includes(d.getDay())) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** Ensures the standard Tue/Wed/Thu morning (10-1) and afternoon (1-5) shifts
 * exist for the next N weeks, inserting only the date+slot combos that don't
 * already have a row. Callable by any signed-in user (not just staff) — the
 * actual write uses an admin client since the template is fixed/hardcoded
 * and safe, but we still require a real session so anonymous visitors can't
 * trigger it. */
export async function ensureUpcomingDutyShifts(
  weeks: number,
  branchId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const admin = createAdminClient();
  const dates = buildUpcomingDutyDates(weeks);

  let existingQuery = admin
    .from("duty_shifts")
    .select("shift_date, start_time, end_time")
    .in("shift_date", dates);
  existingQuery =
    branchId === null
      ? existingQuery.is("branch_id", null)
      : existingQuery.eq("branch_id", branchId);
  const { data: existing, error: existingError } = await existingQuery;
  if (existingError) return { success: false, error: existingError.message };

  const existingKeys = new Set(
    (existing ?? []).map((r) => `${r.shift_date}|${r.start_time}|${r.end_time}`),
  );
  const missing = dates.flatMap((shift_date) =>
    DUTY_SLOTS.filter(
      (slot) => !existingKeys.has(`${shift_date}|${slot.start}|${slot.end}`),
    ).map((slot) => ({
      branch_id: branchId,
      shift_date,
      start_time: slot.start,
      end_time: slot.end,
    })),
  );
  if (missing.length === 0) return { success: true };

  const { error: insertError } = await admin.from("duty_shifts").insert(missing);
  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}
