import { z } from "zod";

export const teamApplicationSchema = z.object({
  fullName: z.string().min(1, "請輸入姓名").max(100),
  contactEmail: z.string().email("請輸入有效的電郵地址"),
  contactPhone: z.string().max(30).optional(),
  applicationType: z.enum(["volunteer", "paid_staff", "book_review_writer"]),
  roleInterest: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
});
export type TeamApplicationInput = z.infer<typeof teamApplicationSchema>;
