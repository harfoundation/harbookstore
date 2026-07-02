import { z } from "zod";

export const cartItemSchema = z.object({
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "購物車是空的"),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
  notes: z.string().max(1000).optional(),
});

export const giftOrderSchema = checkoutSchema.extend({
  orderType: z.literal("gift"),
  recipientName: z.string().min(1, "請填寫收禮人姓名").max(100),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientAddress: z.string().max(300).optional(),
  dedicationCardMessage: z.string().max(500).optional(),
  giftDeliveryMethod: z.enum(["self_pickup", "mail", "digital_card_only"]),
});

export const groupBuyJoinSchema = checkoutSchema.extend({
  orderType: z.literal("group_buy"),
  groupBuyId: z.string().uuid(),
});

export function calculateOrderSubtotalCents(
  items: { quantity: number; unitPriceCents: number }[],
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

export function calculateGroupBuyProgress(currentQty: number, targetQty: number): number {
  if (targetQty <= 0) return 0;
  return Math.min(100, Math.round((currentQty / targetQty) * 100));
}
