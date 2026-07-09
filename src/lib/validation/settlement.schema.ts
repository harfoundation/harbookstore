import { z } from "zod";

export const settlementResourceFormSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.enum(["housing", "business", "employment_study"]),
  titleZh: z.string().min(1, "請輸入中文標題").max(200),
  titleEn: z.string().min(1, "Please enter an English title").max(200),
  bodyMarkdownZh: z.string().min(1, "請輸入中文內容").max(8000),
  bodyMarkdownEn: z.string().min(1, "Please enter English content").max(8000),
  sortOrder: z.number().int(),
  status: z.enum(["draft", "published"]),
});
export type SettlementResourceFormInput = z.infer<typeof settlementResourceFormSchema>;
