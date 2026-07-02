"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  teamApplicationSchema,
  type TeamApplicationInput,
} from "@/lib/validation/team-application.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function submitTeamApplication(
  input: TeamApplicationInput,
): Promise<ActionResult> {
  const parsed = teamApplicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "申請資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const v = parsed.data;
  const { error } = await supabase.from("team_applications").insert({
    applicant_id: user?.id ?? null,
    full_name: v.fullName,
    contact_email: v.contactEmail,
    contact_phone: v.contactPhone || null,
    application_type: v.applicationType,
    role_interest: v.roleInterest || null,
    message: v.message || null,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

const statusSchema = z.enum(["submitted", "reviewing", "accepted", "declined"]);

export async function updateTeamApplicationStatus(
  applicationId: string,
  status: z.infer<typeof statusSchema>,
  adminNotes?: string,
): Promise<ActionResult> {
  if (!statusSchema.safeParse(status).success)
    return { success: false, error: "無效狀態" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_applications")
    .update({ status, admin_notes: adminNotes || null })
    .eq("id", applicationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/applications");
  return { success: true };
}
