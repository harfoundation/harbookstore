"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  devotionalBookFormSchema,
  devotionalVolumeFormSchema,
  devotionalEntryFormSchema,
  type DevotionalBookFormInput,
  type DevotionalVolumeFormInput,
  type DevotionalEntryFormInput,
} from "@/lib/validation/devotional.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertDevotionalBook(
  input: DevotionalBookFormInput,
): Promise<ActionResult> {
  const parsed = devotionalBookFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "書籍資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    slug: v.slug,
    title_zh: v.titleZh,
    title_en: v.titleEn || null,
    author_name: v.authorName || null,
    author_bio_markdown: v.authorBioMarkdown || null,
    declaration_markdown: v.declarationMarkdown || null,
    preface_markdown: v.prefaceMarkdown || null,
    afterword_markdown: v.afterwordMarkdown || null,
    topic_index: v.topicIndex,
    status: v.status,
  };

  const { error } = v.id
    ? await supabase.from("devotional_books").update(row).eq("id", v.id)
    : await supabase.from("devotional_books").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/devotionals");
  revalidatePath("/devotionals");
  revalidatePath(`/devotionals/${v.slug}`);
  return { success: true };
}

export async function upsertDevotionalVolume(
  input: DevotionalVolumeFormInput,
): Promise<ActionResult> {
  const parsed = devotionalVolumeFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "卷次資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    book_id: v.bookId,
    volume_number: v.volumeNumber,
    title_zh: v.titleZh,
    subtitle_zh: v.subtitleZh || null,
    intro_markdown: v.introMarkdown || null,
    sort_order: v.volumeNumber,
  };

  const { error } = v.id
    ? await supabase.from("devotional_volumes").update(row).eq("id", v.id)
    : await supabase.from("devotional_volumes").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/devotionals/${v.bookId}`);
  revalidatePath("/devotionals");
  return { success: true };
}

export async function upsertDevotionalEntry(
  input: DevotionalEntryFormInput,
): Promise<ActionResult> {
  const parsed = devotionalEntryFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "篇章資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const row = {
    book_id: v.bookId,
    volume_id: v.volumeId,
    entry_number: v.entryNumber,
    title: v.title,
    subtitle: v.subtitle || null,
    body_markdown: v.bodyMarkdown,
    scripture_reference: v.scriptureReference || null,
    written_date: v.writtenDate || null,
    status: v.status,
  };

  const { data, error } = v.id
    ? await supabase
        .from("devotional_entries")
        .update(row)
        .eq("id", v.id)
        .select("id")
        .single()
    : await supabase
        .from("devotional_entries")
        .insert({ ...row, author_id: user.id })
        .select("id")
        .single();

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/devotionals/${v.bookId}`);
  revalidatePath(`/admin/devotionals/${v.bookId}/entries/${data.id}`);
  revalidatePath("/devotionals");
  return { success: true };
}
