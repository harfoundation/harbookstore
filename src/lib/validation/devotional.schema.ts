import { z } from "zod";

export const devotionalBookFormSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "請輸入網址代稱")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "只可使用小寫字母、數字與連字號"),
  titleZh: z.string().min(1, "請輸入書名").max(200),
  titleEn: z.string().max(200).optional(),
  authorName: z.string().max(100).optional(),
  authorBioMarkdown: z.string().max(4000).optional(),
  declarationMarkdown: z.string().max(4000).optional(),
  prefaceMarkdown: z.string().max(8000).optional(),
  afterwordMarkdown: z.string().max(8000).optional(),
  topicIndex: z.array(z.string().min(1)).max(100),
  status: z.enum(["draft", "published"]),
});
export type DevotionalBookFormInput = z.infer<typeof devotionalBookFormSchema>;

export const devotionalVolumeFormSchema = z.object({
  id: z.string().uuid().optional(),
  bookId: z.string().uuid(),
  volumeNumber: z.number().int().min(1),
  titleZh: z.string().min(1, "請輸入卷名").max(200),
  subtitleZh: z.string().max(200).optional(),
  introMarkdown: z.string().max(4000).optional(),
});
export type DevotionalVolumeFormInput = z.infer<typeof devotionalVolumeFormSchema>;

export const devotionalEntryFormSchema = z.object({
  id: z.string().uuid().optional(),
  bookId: z.string().uuid(),
  volumeId: z.string().uuid(),
  entryNumber: z.number().int().min(1),
  title: z.string().min(1, "請輸入標題").max(200),
  subtitle: z.string().max(200).optional(),
  bodyMarkdown: z.string().min(1, "請輸入內容"),
  scriptureReference: z.string().max(200).optional(),
  writtenDate: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
});
export type DevotionalEntryFormInput = z.infer<typeof devotionalEntryFormSchema>;
