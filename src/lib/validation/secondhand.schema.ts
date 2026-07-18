import { z } from "zod";

export const secondhandItemFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "請輸入書名/品名").max(200),
  author: z.string().max(100).optional(),
  categoryId: z.string().uuid().nullable(),
  condition: z.enum(["brand_new", "near_new", "good", "fair", "poor"]),
  description: z.string().max(1000).optional(),
  priceCents: z.number().int().min(0),
  originalPriceCents: z.number().int().min(0).nullable().optional(),
  branchId: z.string().uuid().nullable(),
  status: z.enum(["available", "reserved", "sold"]),
});
export type SecondhandItemFormInput = z.infer<typeof secondhandItemFormSchema>;

export const secondhandOrderSchema = z.object({
  itemId: z.string().uuid(),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
});
export type SecondhandOrderInput = z.infer<typeof secondhandOrderSchema>;
