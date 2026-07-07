"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendBookingSubmittedEmail, sendBookingRespondedEmail } from "@/lib/email/send";
import {
  bookableServiceFormSchema,
  serviceBookingSubmitSchema,
  serviceBookingRespondSchema,
  type BookableServiceFormInput,
  type ServiceBookingSubmitInput,
  type ServiceBookingRespondInput,
} from "@/lib/validation/booking.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertBookableService(
  input: BookableServiceFormInput,
): Promise<ActionResult> {
  const parsed = bookableServiceFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "服務資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    branch_id: v.branchId || null,
    name: v.name,
    description: v.description || null,
    category: v.category,
    is_active: v.isActive,
    sort_order: v.sortOrder,
  };

  const { error } = v.id
    ? await supabase.from("bookable_services").update(row).eq("id", v.id)
    : await supabase.from("bookable_services").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/bookable-services");
  revalidatePath("/bookings");
  return { success: true };
}

export async function submitServiceBooking(
  input: ServiceBookingSubmitInput,
): Promise<ActionResult> {
  const parsed = serviceBookingSubmitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "預約資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const v = parsed.data;
  const { data: service } = await supabase
    .from("bookable_services")
    .select("name")
    .eq("id", v.serviceId)
    .single();

  const { error } = await supabase.from("service_bookings").insert({
    service_id: v.serviceId,
    customer_id: user?.id ?? null,
    customer_name: v.customerName,
    customer_email: v.customerEmail,
    customer_phone: v.customerPhone || null,
    party_size: v.partySize ?? null,
    preferred_date: v.preferredDate,
    preferred_time: v.preferredTime || null,
    notes: v.notes || null,
  });

  if (error) return { success: false, error: error.message };

  await sendBookingSubmittedEmail({
    to: v.customerEmail,
    serviceName: service?.name ?? "預約項目",
    preferredDate: v.preferredDate,
    preferredTime: v.preferredTime || null,
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function respondToServiceBooking(
  input: ServiceBookingRespondInput,
): Promise<ActionResult> {
  const parsed = serviceBookingRespondSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "回覆資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const { data: booking, error } = await supabase
    .from("service_bookings")
    .update({
      status: v.status,
      admin_reply_message: v.adminReplyMessage || null,
      responded_by: user.id,
      responded_at: new Date().toISOString(),
    })
    .eq("id", v.bookingId)
    .select("customer_email, preferred_date, preferred_time, bookable_services(name)")
    .single();

  if (error || !booking) return { success: false, error: error?.message ?? "更新失敗" };

  const service = booking.bookable_services as unknown as { name: string } | null;

  await sendBookingRespondedEmail({
    to: booking.customer_email,
    serviceName: service?.name ?? "預約項目",
    preferredDate: booking.preferred_date,
    preferredTime: booking.preferred_time,
    status: v.status,
    adminReplyMessage: v.adminReplyMessage || null,
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}
