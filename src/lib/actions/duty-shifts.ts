"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
const DUTY_START = "10:00:00";
const DUTY_END = "17:00:00";

/** Generates the standard Tue/Wed/Thu 10am-5pm shifts for the next N weeks,
 * skipping any date that already has a shift row. */
export async function generateUpcomingDutyShifts(
  weeks: number,
  branchId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();

  const rows: {
    branch_id: string | null;
    shift_date: string;
    start_time: string;
    end_time: string;
  }[] = [];

  const today = new Date();
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (!DUTY_DAYS.includes(d.getDay())) continue;
    rows.push({
      branch_id: branchId,
      shift_date: d.toISOString().slice(0, 10),
      start_time: DUTY_START,
      end_time: DUTY_END,
    });
  }

  const { error } = await supabase
    .from("duty_shifts")
    .upsert(rows, {
      onConflict: "branch_id,shift_date,start_time,end_time",
      ignoreDuplicates: true,
    });

  if (error) return { success: false, error: error.message };

  revalidatePath("/duty-roster");
  revalidatePath("/admin/duty-roster");
  return { success: true };
}
