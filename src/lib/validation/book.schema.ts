import { z } from "zod";

export const bookFormSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable(),
  posterNumber: z.number().int().positive().nullable(),
  title: z.string().min(1, "請輸入書名").max(200),
  author: z.string().max(100).optional(),
  translator: z.string().max(100).optional(),
  isbn: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
  priceCents: z.number().int().min(0).nullable(),
  groupBuyPriceCents: z.number().int().min(0).nullable(),
  groupBuyMinQty: z.number().int().positive().nullable(),
  procurementStatus: z.enum(["available", "preorder", "out_of_stock", "discontinued"]),
  stockQty: z.number().int().min(0),
  isLendable: z.boolean(),
  isActive: z.boolean(),
});

export type BookFormInput = z.infer<typeof bookFormSchema>;
