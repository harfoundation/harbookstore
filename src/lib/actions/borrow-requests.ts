"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBorrowApprovedWhatsapp } from "@/lib/whatsapp/send";
import { awardPoints } from "@/lib/actions/points";
import type { TablesUpdate } from "@/types/database.types";

type ActionResult = { success: true } | { success: false; error: string };

const createSchema = z.object({
  bookId: z.string().uuid(),
  deliveryMethod: z.enum(["self_pickup", "mail"]),
  branchId: z.string().uuid().optional(),
});

export async function createBorrowRequest(
  input: z.infer<typeof createSchema>,
): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isStaff = !!profile && ["admin", "committee", "instructor"].includes(profile.role);

  if (!isStaff) {
    const { data: membership } = await supabase
      .from("membership_registrations")
      .select("id")
      .eq("profile_id", user.id)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle();
    if (!membership) {
      return { success: false, error: "免費借閱是會員專屬福利，請先登記成為會員" };
    }
  }

  const { error } = await supabase.from("borrow_requests").insert({
    requester_id: user.id,
    book_id: parsed.data.bookId,
    delivery_method: parsed.data.deliveryMethod,
    branch_id:
      parsed.data.deliveryMethod === "self_pickup"
        ? (parsed.data.branchId ?? null)
        : null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/borrow-requests");
  return { success: true };
}

export async function cancelBorrowRequest(
  borrowRequestId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("borrow_requests")
    .update({ status: "cancelled" })
    .eq("id", borrowRequestId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/borrow-requests");
  return { success: true };
}

const adminUpdateSchema = z.object({
  borrowRequestId: z.string().uuid(),
  status: z.enum(["requested", "approved", "picked_up", "returned", "cancelled"]),
  adminNotes: z.string().max(500).optional(),
});

export async function adminUpdateBorrowRequestStatus(
  input: z.infer<typeof adminUpdateSchema>,
): Promise<ActionResult> {
  const parsed = adminUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const update: TablesUpdate<"borrow_requests"> = { status: parsed.data.status };
  if (parsed.data.adminNotes !== undefined) update.admin_notes = parsed.data.adminNotes;
  if (parsed.data.status === "approved") update.approved_at = new Date().toISOString();
  if (parsed.data.status === "picked_up") update.picked_up_at = new Date().toISOString();
  if (parsed.data.status === "returned") update.returned_at = new Date().toISOString();

  const { error } = await supabase
    .from("borrow_requests")
    .update(update)
    .eq("id", parsed.data.borrowRequestId);

  if (error) return { success: false, error: error.message };

  if (parsed.data.status === "approved") {
    const { data: request } = await supabase
      .from("borrow_requests")
      .select("requester_id, books(title)")
      .eq("id", parsed.data.borrowRequestId)
      .single();
    if (request) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("phone")
        .eq("id", request.requester_id)
        .single();
      const book = request.books as unknown as { title: string } | null;
      if (profile?.phone && book?.title) {
        await sendBorrowApprovedWhatsapp({ to: profile.phone, bookTitle: book.title });
      }
    }
  }

  if (parsed.data.status === "returned") {
    const { data: request } = await supabase
      .from("borrow_requests")
      .select("requester_id")
      .eq("id", parsed.data.borrowRequestId)
      .single();
    if (request) {
      await awardPoints(supabase, request.requester_id, "borrow_returned");
    }
  }

  revalidatePath("/admin/borrow-requests");
  revalidatePath("/borrow-requests");
  return { success: true };
}
