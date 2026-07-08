"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  readingShareFormSchema,
  type ReadingShareFormInput,
} from "@/lib/validation/reading-share.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function submitReadingShare(
  input: ReadingShareFormInput,
): Promise<ActionResult> {
  const parsed = readingShareFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請確認表單內容" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入才能分享" };

  const v = parsed.data;
  const { error } = await supabase.from("reading_shares").insert({
    book_id: v.bookId,
    submitted_by: user.id,
    shared_by_name: v.sharedByName || null,
    source_group: v.sourceGroup || null,
    quote_text: v.quoteText,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/reading-shares");
  revalidatePath(`/catalog/${v.bookId}`);
  return { success: true };
}

export async function setReadingShareHidden(
  shareId: string,
  isHidden: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reading_shares")
    .update({ is_hidden: isHidden })
    .eq("id", shareId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/reading-shares");
  revalidatePath("/admin/reading-shares");
  return { success: true };
}

export async function deleteReadingShare(shareId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("reading_shares").delete().eq("id", shareId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/reading-shares");
  revalidatePath("/admin/reading-shares");
  return { success: true };
}
