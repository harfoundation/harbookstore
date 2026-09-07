"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateText } from "@/lib/translation/translate";

type ActionResult = { success: true } | { success: false; error: string };
type CreateSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };
type AddCaptionResult =
  | { success: true; translatedText: string }
  | { success: false; error: string };

export async function createTranslationSession(input: {
  title: string;
  sourceLang: string;
  targetLang: string;
  branchId: string | null;
}): Promise<CreateSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { data, error } = await supabase
    .from("translation_sessions")
    .insert({
      title: input.title,
      source_lang: input.sourceLang,
      target_lang: input.targetLang,
      branch_id: input.branchId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "建立場次失敗" };

  revalidatePath("/admin/live-translate");
  return { success: true, sessionId: data.id };
}

export async function endTranslationSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("translation_sessions")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/live-translate");
  revalidatePath(`/live-translate/${sessionId}`);
  return { success: true };
}

/** Translates one finalized phrase from the speaker's live transcript and
 * broadcasts it to listeners via the translation_captions realtime feed. */
export async function addTranslationCaption(
  sessionId: string,
  sourceText: string,
): Promise<AddCaptionResult> {
  const text = sourceText.trim();
  if (!text) return { success: false, error: "空白內容" };

  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("translation_sessions")
    .select("source_lang, target_lang, status")
    .eq("id", sessionId)
    .single();
  if (sessionError || !session) return { success: false, error: "找不到此場次" };
  if (session.status !== "active") return { success: false, error: "此場次已結束" };

  let translatedText: string;
  try {
    translatedText = await translateText(text, session.source_lang, session.target_lang);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "翻譯失敗" };
  }
  if (!translatedText) return { success: false, error: "翻譯結果為空" };

  const { error: insertError } = await supabase.from("translation_captions").insert({
    session_id: sessionId,
    source_text: text,
    translated_text: translatedText,
  });
  if (insertError) return { success: false, error: insertError.message };

  return { success: true, translatedText };
}
