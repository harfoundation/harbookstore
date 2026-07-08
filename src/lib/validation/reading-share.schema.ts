import { z } from "zod";

export const readingShareFormSchema = z.object({
  bookId: z.string().uuid("請選擇書籍"),
  sharedByName: z.string().max(100).optional(),
  sourceGroup: z.string().max(100).optional(),
  quoteText: z.string().min(1, "請貼上分享內容").max(3000),
});
export type ReadingShareFormInput = z.infer<typeof readingShareFormSchema>;
