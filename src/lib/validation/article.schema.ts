import { z } from "zod";

export const articleFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "請輸入標題").max(200),
  slug: z
    .string()
    .min(1, "請輸入網址代稱")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "只可使用小寫字母、數字與連字號"),
  bodyMarkdown: z.string().min(1, "請輸入內容"),
  relatedBookId: z.string().uuid().nullable(),
  relatedCategoryId: z.string().uuid().nullable(),
  status: z.enum(["draft", "published", "archived"]),
});
export type ArticleFormInput = z.infer<typeof articleFormSchema>;

export const readerQuestionSubmitSchema = z.object({
  questionBody: z.string().min(1, "請輸入您的問題").max(2000),
  submitterDisplayName: z.string().max(60).optional(),
  isAnonymous: z.boolean(),
});
export type ReaderQuestionSubmitInput = z.infer<typeof readerQuestionSubmitSchema>;

export const readerQuestionRespondSchema = z.object({
  questionId: z.string().uuid(),
  adminResponseBody: z.string().min(1, "請輸入回覆內容").max(2000),
  status: z.enum(["answered_private", "answered_public", "declined"]),
});
export type ReaderQuestionRespondInput = z.infer<typeof readerQuestionRespondSchema>;
