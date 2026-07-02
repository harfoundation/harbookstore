"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  readerQuestionRespondSchema,
  readerQuestionSubmitSchema,
  type ReaderQuestionRespondInput,
  type ReaderQuestionSubmitInput,
} from "@/lib/validation/article.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function submitReaderQuestion(
  input: ReaderQuestionSubmitInput,
): Promise<ActionResult> {
  const parsed = readerQuestionSubmitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請輸入您的問題" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("reader_questions").insert({
    submitter_id: parsed.data.isAnonymous ? null : (user?.id ?? null),
    submitter_display_name: parsed.data.submitterDisplayName || null,
    question_body: parsed.data.questionBody,
    is_anonymous: parsed.data.isAnonymous,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/ask");
  return { success: true };
}

export async function adminRespondToQuestion(
  input: ReaderQuestionRespondInput,
): Promise<ActionResult> {
  const parsed = readerQuestionRespondSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { error } = await supabase
    .from("reader_questions")
    .update({
      admin_response_body: parsed.data.adminResponseBody,
      status: parsed.data.status,
      responded_by: user.id,
      responded_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.questionId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/reader-questions");
  revalidatePath("/ask");
  return { success: true };
}
