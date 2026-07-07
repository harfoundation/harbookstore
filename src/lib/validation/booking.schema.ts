import { z } from "zod";

export const bookableServiceFormSchema = z.object({
  id: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  name: z.string().min(1, "請輸入服務名稱").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["cafe_coop", "consultation", "venue_hire", "other"]),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});
export type BookableServiceFormInput = z.infer<typeof bookableServiceFormSchema>;

export const serviceBookingSubmitSchema = z.object({
  serviceId: z.string().uuid(),
  customerName: z.string().min(1, "請輸入姓名").max(100),
  customerEmail: z.string().email("請輸入有效的電郵地址"),
  customerPhone: z.string().max(30).optional(),
  partySize: z.number().int().min(1).max(50).optional(),
  preferredDate: z.string().min(1, "請選擇日期"),
  preferredTime: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});
export type ServiceBookingSubmitInput = z.infer<typeof serviceBookingSubmitSchema>;

export const serviceBookingRespondSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["confirmed", "declined"]),
  adminReplyMessage: z.string().max(1000).optional(),
});
export type ServiceBookingRespondInput = z.infer<typeof serviceBookingRespondSchema>;
