"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(
  bookId: string,
): Promise<{ inWishlist: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "請先登入" };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("book_id")
    .eq("profile_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("wishlists")
      .delete()
      .eq("profile_id", user.id)
      .eq("book_id", bookId);
    revalidatePath(`/catalog/${bookId}`);
    return { inWishlist: false };
  }

  await supabase.from("wishlists").insert({ profile_id: user.id, book_id: bookId });
  revalidatePath(`/catalog/${bookId}`);
  return { inWishlist: true };
}
