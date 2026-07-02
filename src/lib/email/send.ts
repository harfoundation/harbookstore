import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM =
  process.env.RESEND_FROM_EMAIL ?? "山書房 Har Bookstore <no-reply@harfoundation.org.au>";

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
    subject: `訂單確認 ${params.orderNumber} — 山書房`,
    react: OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      subtotalCents: params.subtotalCents,
    }),
  });
}
