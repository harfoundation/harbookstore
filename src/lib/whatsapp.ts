/**
 * wa.me deep-link helper — no WhatsApp Business API involved, just opens a
 * chat with our number in the user's WhatsApp app/web client.
 */
export function getWhatsappLink(message?: string): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!raw) return null;

  const digitsOnly = raw.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${digitsOnly}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
