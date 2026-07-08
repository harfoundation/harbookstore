import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { BookingSubmittedEmail } from "@/lib/email/templates/booking-submitted";
import { BookingRespondedEmail } from "@/lib/email/templates/booking-responded";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM =
  process.env.RESEND_FROM_EMAIL ?? "山書坊 Har Book Club <no-reply@harfoundation.org.au>";

export async function sendOrderConfirmationEmail(params: {
  userId: string;
  orderNumber: string;
  subtotalCents: number;
}) {
  if (!resend) {
    console.log(
      `[email:dev] order confirmation ${params.orderNumber} — RESEND_API_KEY not set, skipping send`,
    );
    return;
  }

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(params.userId);
  const to = data.user?.email;
  if (!to) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `訂單確認 ${params.orderNumber} — 山書坊`,
    react: OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      subtotalCents: params.subtotalCents,
    }),
  });
}

export async function sendBookingSubmittedEmail(params: {
  to: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string | null;
}) {
  if (!resend) {
    console.log(
      `[email:dev] booking submitted for ${params.serviceName} — RESEND_API_KEY not set, skipping send`,
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `預約已收到 — ${params.serviceName} — 山書坊`,
    react: BookingSubmittedEmail({
      serviceName: params.serviceName,
      preferredDate: params.preferredDate,
      preferredTime: params.preferredTime,
    }),
  });
}

export async function sendBookingRespondedEmail(params: {
  to: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string | null;
  status: "confirmed" | "declined";
  adminReplyMessage: string | null;
}) {
  if (!resend) {
    console.log(
      `[email:dev] booking ${params.status} for ${params.serviceName} — RESEND_API_KEY not set, skipping send`,
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `預約${params.status === "confirmed" ? "已確認" : "無法安排"} — ${params.serviceName} — 山書坊`,
    react: BookingRespondedEmail({
      serviceName: params.serviceName,
      preferredDate: params.preferredDate,
      preferredTime: params.preferredTime,
      status: params.status,
      adminReplyMessage: params.adminReplyMessage,
    }),
  });
}
