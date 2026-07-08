import { z } from "zod";

export const churchFormSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "請輸入網址代稱")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "只可使用小寫英文、數字與連字號"),
  nameZh: z.string().min(1, "請輸入堂會名稱").max(100),
  nameEn: z.string().max(150).optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email("請輸入有效電郵").optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  isActive: z.boolean(),
  billingStatus: z.enum(["internal", "trial", "pending_invoice", "paid", "overdue", "cancelled"]),
  billingPlanCents: z.number().int().min(0).nullable(),
  billingNotes: z.string().max(1000).optional(),
});
export type ChurchFormInput = z.infer<typeof churchFormSchema>;

export const churchServiceFormSchema = z.object({
  id: z.string().uuid().optional(),
  churchId: z.string().uuid(),
  nameZh: z.string().min(1, "請輸入聚會名稱").max(100),
  scheduleLabel: z.string().min(1, "請輸入聚會時間說明").max(100),
  dayOfWeek: z.number().int().min(0).max(6).nullable(),
  language: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
export type ChurchServiceFormInput = z.infer<typeof churchServiceFormSchema>;

export const worshipSongFormSchema = z.object({
  id: z.string().uuid().optional(),
  churchId: z.string().uuid(),
  title: z.string().min(1, "請輸入詩歌名稱").max(200),
  lyricsMarkdown: z.string().max(5000).optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
});
export type WorshipSongFormInput = z.infer<typeof worshipSongFormSchema>;

export const serviceMaterialFormSchema = z.object({
  id: z.string().uuid().optional(),
  churchId: z.string().uuid(),
  serviceId: z.string().uuid(),
  serviceDate: z.string().min(1, "請選擇日期"),
  sermonTitle: z.string().max(200).optional(),
  sermonSpeaker: z.string().max(100).optional(),
  sermonPptUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
  status: z.enum(["draft", "published"]),
  songIds: z.array(z.string().uuid()),
});
export type ServiceMaterialFormInput = z.infer<typeof serviceMaterialFormSchema>;

export const churchRegistrationFormSchema = z.object({
  churchId: z.string().uuid(),
  registrationType: z.enum(["newcomer", "co_worker"]),
  fullName: z.string().min(1, "請輸入姓名").max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email("請輸入有效電郵").optional().or(z.literal("")),
  congregationId: z.string().uuid().optional(),
  message: z.string().max(1000).optional(),
});
export type ChurchRegistrationFormInput = z.infer<typeof churchRegistrationFormSchema>;

export const respondChurchRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  status: z.enum(["new", "contacted", "confirmed", "archived"]),
});
export type RespondChurchRegistrationInput = z.infer<typeof respondChurchRegistrationSchema>;

export const churchAnnouncementFormSchema = z.object({
  id: z.string().uuid().optional(),
  churchId: z.string().uuid(),
  title: z.string().min(1, "請輸入標題").max(200),
  bodyMarkdown: z.string().min(1, "請輸入內容").max(5000),
  status: z.enum(["draft", "published"]),
});
export type ChurchAnnouncementFormInput = z.infer<typeof churchAnnouncementFormSchema>;
