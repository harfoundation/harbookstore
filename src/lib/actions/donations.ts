"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/actions/points";
import {
  donationPledgeSchema,
  type DonationPledgeInput,
} from "@/lib/validation/donation.schema";

type ActionResult =
  | { success: true; pledgeNumber: string }
  | { success: false; error: string };

export async function submitDonationPledge(
  input: DonationPledgeInput,
): Promise<ActionResult> {
  const parsed = donationPledgeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const v = parsed.data;
  const { data, error } = await supabase
    .from("donation_pledges")
    .insert({
      donor_id: user?.id ?? null,
      donor_name: v.donorName,
      donor_email: v.donorEmail || null,
      donor_phone: v.donorPhone || null,
      amount_cents: v.amountCents,
      purpose_note: v.purposeNote || null,
      payment_method: v.paymentMethod,
    })
    .select("pledge_number")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "送出失敗" };

  revalidatePath("/admin/donations");
  return { success: true, pledgeNumber: data.pledge_number };
}

type UpdateActionResult = { success: true } | { success: false; error: string };

export async function markDonationReceived(
  pledgeId: string,
  received: boolean,
): Promise<UpdateActionResult> {
  const supabase = await createClient();
  const { data: pledge, error } = await supabase
    .from("donation_pledges")
    .update({
      status: received ? "confirmed" : "pending_review",
      payment_received_at: received ? new Date().toISOString() : null,
    })
    .eq("id", pledgeId)
    .select("donor_id")
    .single();

  if (error) return { success: false, error: error.message };

  if (received && pledge?.donor_id) {
    await awardPoints(supabase, pledge.donor_id, "donation");
  }

  revalidatePath("/admin/donations");
  return { success: true };
}
