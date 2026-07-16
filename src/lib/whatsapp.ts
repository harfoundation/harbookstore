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

/**
 * wa.me share-out link with no target number — opens WhatsApp's own contact/
 * group picker so the user can repost pre-filled text to any chat. This is
 * the "backup the other direction" half of reading-shares: a saved entry can
 * be reposted to a Community/Group in one tap.
 */
export function getWhatsappShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Invite link to our WhatsApp Community — null if not configured. */
export function getWhatsappCommunityLink(): string | null {
  return process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || null;
}
