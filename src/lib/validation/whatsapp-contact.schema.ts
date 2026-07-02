import { z } from "zod";

export const whatsappContactSchema = z.object({
  phoneNumber: z.string().min(1, "請輸入電話號碼").max(30),
  displayName: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).default([]),
  optIn: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});
export type WhatsappContactInput = z.infer<typeof whatsappContactSchema>;

export const whatsappContactBulkImportSchema = z.object({
  rows: z
    .array(
      z.object({
        phoneNumber: z.string().min(1).max(30),
        displayName: z.string().max(100).optional(),
      }),
    )
    .min(1, "請至少提供一筆聯絡人")
    .max(2000, "單次匯入上限 2000 筆"),
  tags: z.array(z.string().max(30)).default([]),
});
export type WhatsappContactBulkImportInput = z.infer<
  typeof whatsappContactBulkImportSchema
>;
