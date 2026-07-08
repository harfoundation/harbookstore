"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  congregationFormSchema,
  congregationMemberFormSchema,
  toggleCheckinSchema,
  addWalkInSchema,
  removeCheckinSchema,
  type CongregationFormInput,
  type CongregationMemberFormInput,
  type ToggleCheckinInput,
  type AddWalkInInput,
  type RemoveCheckinInput,
} from "@/lib/validation/attendance.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertCongregation(
  input: CongregationFormInput,
): Promise<ActionResult> {
  const parsed = congregationFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "堂會資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    church_id: v.churchId,
    name: v.name,
    service_period: v.servicePeriod,
    sort_order: v.sortOrder,
    is_active: v.isActive,
  };

  const { error } = v.id
    ? await supabase.from("congregations").update(row).eq("id", v.id)
    : await supabase.from("congregations").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/congregations");
  revalidatePath("/admin/check-in");
  revalidatePath("/admin/churches");
  return { success: true };
}

export async function upsertCongregationMember(
  input: CongregationMemberFormInput,
): Promise<ActionResult> {
  const parsed = congregationMemberFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "成員資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    congregation_id: v.congregationId,
    display_name: v.displayName,
    member_type: v.memberType,
    notes: v.notes || null,
    is_active: v.isActive,
  };

  const { error } = v.id
    ? await supabase.from("congregation_members").update(row).eq("id", v.id)
    : await supabase.from("congregation_members").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/congregations/${v.congregationId}/roster`);
  revalidatePath("/admin/check-in");
  return { success: true };
}

async function getOrCreateSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  congregationId: string,
  serviceDate: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("congregation_id", congregationId)
    .eq("service_date", serviceDate)
    .maybeSingle();

  if (existing) return existing.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: created, error } = await supabase
    .from("attendance_sessions")
    .insert({
      congregation_id: congregationId,
      service_date: serviceDate,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function toggleCheckin(input: ToggleCheckinInput): Promise<ActionResult> {
  const parsed = toggleCheckinSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "打卡資料無效" };

  const supabase = await createClient();
  const v = parsed.data;

  try {
    const sessionId = await getOrCreateSession(supabase, v.congregationId, v.serviceDate);

    const { data: existingCheckin } = await supabase
      .from("attendance_checkins")
      .select("id")
      .eq("session_id", sessionId)
      .eq("member_id", v.memberId)
      .maybeSingle();

    if (existingCheckin) {
      const { error } = await supabase
        .from("attendance_checkins")
        .delete()
        .eq("id", existingCheckin.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("attendance_checkins").insert({
        session_id: sessionId,
        member_id: v.memberId,
        display_name: v.displayName,
        member_type: v.memberType,
      });
      if (error) return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "打卡失敗" };
  }

  revalidatePath("/admin/check-in");
  return { success: true };
}

export async function addWalkInCheckin(input: AddWalkInInput): Promise<ActionResult> {
  const parsed = addWalkInSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請輸入姓名" };

  const supabase = await createClient();
  const v = parsed.data;

  try {
    const sessionId = await getOrCreateSession(supabase, v.congregationId, v.serviceDate);

    const { error } = await supabase.from("attendance_checkins").insert({
      session_id: sessionId,
      member_id: null,
      display_name: v.displayName,
      member_type: "new_friend",
    });
    if (error) return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "新增失敗" };
  }

  revalidatePath("/admin/check-in");
  return { success: true };
}

export async function removeCheckin(input: RemoveCheckinInput): Promise<ActionResult> {
  const parsed = removeCheckinSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance_checkins")
    .delete()
    .eq("id", parsed.data.checkinId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/check-in");
  return { success: true };
}
