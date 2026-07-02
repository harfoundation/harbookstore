"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  articleFormSchema,
  type ArticleFormInput,
} from "@/lib/validation/article.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertArticle(input: ArticleFormInput): Promise<ActionResult> {
  const parsed = articleFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "文章資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const baseRow = {
    title: v.title,
    slug: v.slug,
    body_markdown: v.bodyMarkdown,
    related_book_id: v.relatedBookId,
    related_category_id: v.relatedCategoryId,
    status: v.status,
  };

  let error;
  if (v.id) {
    // Only stamp published_at the first time an article goes live — re-saving
    // an already-published article shouldn't bump its publish date.
    const { data: existing } = await supabase
      .from("articles")
      .select("published_at")
      .eq("id", v.id)
      .single();
    const publishedAt =
      v.status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : null;
    ({ error } = await supabase
      .from("articles")
      .update({ ...baseRow, published_at: publishedAt })
      .eq("id", v.id));
  } else {
    ({ error } = await supabase.from("articles").insert({
      ...baseRow,
      published_at: v.status === "published" ? new Date().toISOString() : null,
      author_id: user.id,
    }));
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath(`/articles/${v.slug}`);
  return { success: true };
}
