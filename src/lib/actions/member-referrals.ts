"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/actions/points";
import {
  memberReferralSchema,
  type MemberReferralInput,
} from "@/lib/validation/member-referral.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function referMember(input: MemberReferralInput): Promise<ActionResult> {
  const parsed = memberReferralSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入才能推薦" };

  const v = parsed.data;
  const { error } = await supabase.from("member_referrals").insert({
    referred_by: user.id,
    referred_name: v.referredName,
    referred_contact: v.referredContact || null,
    message: v.message || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/referrals");
  return { success: true };
}

type UpdateActionResult = { success: true } | { success: false; error: string };

export async function updateReferralStatus(
  referralId: string,
  status: "pending" | "joined" | "declined",
): Promise<UpdateActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_referrals")
    .update({ status })
    .eq("id", referralId)
    .select("referred_by")
    .single();

  if (error) return { success: false, error: error.message };

  if (status === "joined" && data?.referred_by) {
    await awardPoints(supabase, data.referred_by, "referral");
  }

  revalidatePath("/admin/referrals");
  return { success: true };
}
