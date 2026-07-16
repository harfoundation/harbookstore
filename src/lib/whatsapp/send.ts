import "server-only";

/**
 * WhatsApp Business Cloud API sender — mirrors the Resend email pattern in
 * src/lib/email/send.ts: no-op (logged) when credentials aren't configured,
 * so this never blocks the rest of an action if the business account hasn't
 * been set up yet.
 *
 * Requires a Meta for Developers app with the WhatsApp product, a verified
 * business phone number, and (for any message sent outside the 24h customer
 * service window) an approved message template — free-text sends only work
 * within 24h of the user's last message to us, which we can't guarantee, so
 * every helper below sends via a named template rather than free text.
 */

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = "v21.0";

type TemplateParam = { type: "text"; text: string };

async function sendWhatsappTemplate(params: {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams?: TemplateParam[];
}): Promise<{ sent: boolean; error?: string }> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log(
      `[whatsapp:dev] template "${params.templateName}" to ${params.to} — WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID not set, skipping send`,
    );
    return { sent: false, error: "not_configured" };
  }

  const digitsOnly = params.to.replace(/[^0-9]/g, "");

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digitsOnly,
        type: "template",
        template: {
          name: params.templateName,
          language: { code: params.languageCode ?? "zh_TW" },
          ...(params.bodyParams?.length
            ? { components: [{ type: "body", parameters: params.bodyParams }] }
            : {}),
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`[whatsapp] send failed (${res.status}):`, body);
    return { sent: false, error: body };
  }

  return { sent: true };
}

/** Sent when a borrow request is confirmed/approved by staff. */
export async function sendBorrowApprovedWhatsapp(params: {
  to: string;
  bookTitle: string;
}) {
  return sendWhatsappTemplate({
    to: params.to,
    templateName: "borrow_request_approved",
    bodyParams: [{ type: "text", text: params.bookTitle }],
  });
}

/** Sent when a membership registration is confirmed. */
export async function sendMembershipConfirmedWhatsapp(params: {
  to: string;
  registrationNumber: string;
}) {
  return sendWhatsappTemplate({
    to: params.to,
    templateName: "membership_confirmed",
    bodyParams: [{ type: "text", text: params.registrationNumber }],
  });
}

/** Sent when an order is confirmed (payment received). */
export async function sendOrderConfirmedWhatsapp(params: {
  to: string;
  orderNumber: string;
}) {
  return sendWhatsappTemplate({
    to: params.to,
    templateName: "order_confirmed",
    bodyParams: [{ type: "text", text: params.orderNumber }],
  });
}
