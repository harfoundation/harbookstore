"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  membershipRegistrationSchema,
  membershipFeeSettingsSchema,
  type MembershipRegistrationInput,
  type MembershipFeeSettingsInput,
} from "@/lib/validation/membership.schema";

type ActionResult =
  | { success: true; registrationNumber: string }
  | { success: false; error: string };

export async function submitMembershipRegistration(
  input: MembershipRegistrationInput,
): Promise<ActionResult> {
  const parsed = membershipRegistrationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入才能登記" };

  const { data: settings } = await supabase
    .from("membership_fee_settings")
    .select("fee_cents, currency")
    .single();

  const isFree = (settings?.fee_cents ?? 0) === 0;
  if (!isFree && !parsed.data.paymentMethod) {
    return { success: false, error: "請選擇繳費方式" };
  }

  const v = parsed.data;
  const { data, error } = await supabase
    .from("membership_registrations")
    .insert({
      profile_id: user.id,
      fee_cents: settings?.fee_cents ?? null,
      currency: settings?.currency ?? "AUD",
      payment_method: isFree ? "to_be_arranged" : v.paymentMethod,
      status: isFree ? "confirmed" : "pending_review",
      payment_received_at: isFree ? new Date().toISOString() : null,
    })
    .select("registration_number")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "送出失敗" };

  revalidatePath("/admin/membership");
  return { success: true, registrationNumber: data.registration_number };
}

type UpdateActionResult = { success: true } | { success: false; error: string };

export async function markMembershipRegistrationReceived(
  registrationId: string,
  received: boolean,
): Promise<UpdateActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("membership_registrations")
    .update({
      status: received ? "confirmed" : "pending_review",
      payment_received_at: received ? new Date().toISOString() : null,
    })
    .eq("id", registrationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/membership");
  return { success: true };
}

export async function updateMembershipFeeSettings(
  input: MembershipFeeSettingsInput,
): Promise<UpdateActionResult> {
  const parsed = membershipFeeSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase
    .from("membership_fee_settings")
    .update({ fee_cents: v.feeCents, usage_note: v.usageNote || null })
    .eq("id", true);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/membership");
  revalidatePath("/membership");
  return { success: true };
}
