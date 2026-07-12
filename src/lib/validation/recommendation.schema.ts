import { z } from "zod";

export const bookRecommendationSchema = z.object({
  bookId: z.string().uuid(),
  recipientName: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});
export type BookRecommendationInput = z.infer<typeof bookRecommendationSchema>;
