"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  bookRecommendationSchema,
  type BookRecommendationInput,
} from "@/lib/validation/recommendation.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function recommendBookToFriend(
  input: BookRecommendationInput,
): Promise<ActionResult> {
  const parsed = bookRecommendationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入才能推薦" };

  const v = parsed.data;
  const { error } = await supabase.from("book_recommendations").insert({
    book_id: v.bookId,
    recommended_by: user.id,
    recipient_name: v.recipientName || null,
    message: v.message || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/catalog/${v.bookId}`);
  revalidatePath("/catalog");
  return { success: true };
}
