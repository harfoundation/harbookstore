import { z } from "zod";

export const eventFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "請輸入活動名稱").max(200),
  slug: z
    .string()
    .min(1, "請輸入網址代稱")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "只可使用小寫字母、數字與連字號"),
  description: z.string().max(500).optional(),
  bodyMarkdown: z.string().max(4000).optional(),
  eventDate: z.string().min(1, "請選擇日期"),
  eventTime: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  posterImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});
export type EventFormInput = z.infer<typeof eventFormSchema>;
