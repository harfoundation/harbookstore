"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const POINT_VALUES = {
  donation: 20,
  membership: 10,
  referral: 15,
  borrow_returned: 5,
} as const;

/** Awards recognition points for a confirmed member action. Caller must
 * already run inside a staff-authenticated context (this inserts under the
 * `member_points_ledger_staff_insert` RLS policy). Never throws — a failed
 * point award shouldn't block the underlying action it's attached to. */
export async function awardPoints(
  supabase: SupabaseClient<Database>,
  profileId: string,
  reason: keyof typeof POINT_VALUES,
) {
  const { error } = await supabase.from("member_points_ledger").insert({
    profile_id: profileId,
    points: POINT_VALUES[reason],
    reason,
  });
  if (error) console.error(`[points] failed to award ${reason} points:`, error);
}

type AdjustResult = { success: true } | { success: false; error: string };

export async function adminAdjustPoints(
  profileId: string,
  points: number,
  note: string,
): Promise<AdjustResult> {
  if (!Number.isInteger(points) || points === 0) {
    return { success: false, error: "點數必須為非零整數" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { error } = await supabase.from("member_points_ledger").insert({
    profile_id: profileId,
    points,
    reason: "admin_adjustment",
    note: note || null,
    awarded_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/points");
  return { success: true };
}
