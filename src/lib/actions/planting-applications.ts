"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { PROGRAM } from "@/lib/planting/program";
import {
  plantingApplicationSchema,
  plantingReviewSchema,
  type PlantingApplicationInput,
  type PlantingReviewInput,
} from "@/lib/validation/planting.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function submitPlantingApplication(
  input: PlantingApplicationInput,
): Promise<ActionResult> {
  const parsed = plantingApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "申請資料無效" };
  }

  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "請先登入" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("planting_applications")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("cohort_label", PROGRAM.cohortLabel)
    .maybeSingle();
  if (existing) return { success: false, error: "你已申請這一期，我們會盡快與你聯絡" };

  const v = parsed.data;
  const { error } = await supabase.from("planting_applications").insert({
    profile_id: profile.id,
    cohort_label: PROGRAM.cohortLabel,
    full_name: v.fullName,
    contact_email: v.contactEmail,
    contact_phone: v.contactPhone || null,
    home_church: v.homeChurch || null,
    referee_name: v.refereeName || null,
    referee_contact: v.refereeContact || null,
    track: v.track,
    seminary_background: v.seminaryBackground || null,
    planting_vision: v.plantingVision,
    weekly_hours: v.weeklyHours ?? null,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/planting/apply");
  revalidatePath("/admin/planting");
  return { success: true };
}

export async function reviewPlantingApplication(
  input: PlantingReviewInput,
): Promise<ActionResult> {
  const parsed = plantingReviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role))
    return { success: false, error: "沒有權限" };

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase
    .from("planting_applications")
    .update({ status: v.status, reviewed_by: profile.id })
    .eq("id", v.applicationId);
  if (error) return { success: false, error: error.message };

  // Notes live in a staff-only table (applicants can read their own row).
  const { error: notesError } = v.interviewNotes
    ? await supabase.from("planting_application_notes").upsert({
        application_id: v.applicationId,
        interview_notes: v.interviewNotes,
        updated_by: profile.id,
      })
    : await supabase
        .from("planting_application_notes")
        .delete()
        .eq("application_id", v.applicationId);
  if (notesError) return { success: false, error: notesError.message };

  revalidatePath("/admin/planting");
  revalidatePath("/planting/apply");
  return { success: true };
}
