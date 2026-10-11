"use server";

import { revalidatePath } from "next/cache";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { runTutor, type TutorSource } from "@/lib/ai-tutor/tutor";
import { isTutorLive, runDemoTutor } from "@/lib/ai-tutor/demo";

type ActionResult = { success: true } | { success: false; error: string };

// Pilot cost guard: questions per student per rolling 24h (staff are exempt).
const DAILY_QUESTION_LIMIT = 30;
// Prior turns resent to the model for context.
const HISTORY_TURNS = 10;

const askSchema = z.object({
  conversationId: z.string().uuid().optional(),
  question: z.string().trim().min(1).max(2000),
});

export type AskTutorResult =
  | {
      success: true;
      conversationId: string;
      answer: { id: string; content: string; sources: TutorSource[] };
    }
  | { success: false; error: string };

export async function hasTutorAccess(): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  if (isStaffRole(profile.role)) return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_tutor_members")
    .select("profile_id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  return !!data;
}

export async function askTutor(
  input: z.input<typeof askSchema>,
): Promise<AskTutorResult> {
  const parsed = askSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "請輸入問題（最多 2000 字）" };

  const profile = await getCurrentProfile();
  if (!profile) return { success: false, error: "請先登入" };
  if (!(await hasTutorAccess())) {
    return { success: false, error: "HAR AI 神學導師目前只開放給受邀學員" };
  }

  const admin = createAdminClient();

  if (!isStaffRole(profile.role)) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("ai_tutor_messages")
      .select("id, ai_tutor_conversations!inner(profile_id)", {
        count: "exact",
        head: true,
      })
      .eq("ai_tutor_conversations.profile_id", profile.id)
      .eq("role", "user")
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_QUESTION_LIMIT) {
      return {
        success: false,
        error: `每天最多提問 ${DAILY_QUESTION_LIMIT} 次，請明天再來`,
      };
    }
  }

  let conversationId = parsed.data.conversationId;
  const isNewConversation = !conversationId;
  if (conversationId) {
    const { data: convo } = await admin
      .from("ai_tutor_conversations")
      .select("profile_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!convo || convo.profile_id !== profile.id)
      return { success: false, error: "找不到這個對話" };
  } else {
    const { data: convo, error } = await admin
      .from("ai_tutor_conversations")
      .insert({ profile_id: profile.id, title: parsed.data.question.slice(0, 60) })
      .select("id")
      .single();
    if (error || !convo)
      return { success: false, error: error?.message ?? "無法建立對話" };
    conversationId = convo.id;
  }

  const { data: prior } = await admin
    .from("ai_tutor_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_TURNS * 2);

  const { data: userMessage, error: userInsertError } = await admin
    .from("ai_tutor_messages")
    .insert({
      conversation_id: conversationId,
      role: "user",
      content: parsed.data.question,
    })
    .select("id")
    .single();
  if (userInsertError || !userMessage)
    return { success: false, error: userInsertError?.message ?? "無法儲存問題" };

  const history: Anthropic.Beta.BetaMessageParam[] = (prior ?? [])
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  // The trimmed window must start with a user turn.
  while (history.length > 0 && history[0].role !== "user") history.shift();
  history.push({ role: "user", content: parsed.data.question });

  let reply;
  try {
    reply = isTutorLive()
      ? await runTutor(history)
      : await runDemoTutor(parsed.data.question);
  } catch (err) {
    console.error("ai-tutor run failed", err);
    // Don't leave an unanswered question (or an empty new conversation) behind;
    // the client restores the text so the student can retry.
    if (isNewConversation) {
      await admin.from("ai_tutor_conversations").delete().eq("id", conversationId);
    } else {
      await admin.from("ai_tutor_messages").delete().eq("id", userMessage.id);
    }
    return { success: false, error: "AI 導師暫時無法回應，請稍後再試" };
  }

  const sources = reply.sources.slice(0, 40);
  const { data: saved, error: saveError } = await admin
    .from("ai_tutor_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply.text,
      sources,
      input_tokens: reply.inputTokens,
      output_tokens: reply.outputTokens,
    })
    .select("id")
    .single();
  if (saveError || !saved)
    return { success: false, error: saveError?.message ?? "無法儲存回答" };

  revalidatePath("/tutor");
  return {
    success: true,
    conversationId,
    answer: { id: saved.id, content: reply.text, sources },
  };
}

// admin -------------------------------------------------------------------------

async function requireStaff() {
  const profile = await getCurrentProfile();
  return profile && isStaffRole(profile.role) ? profile : null;
}

export async function adminGrantTutorAccess(email: string): Promise<ActionResult> {
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) return { success: false, error: "請輸入有效的電郵地址" };
  if (!(await requireStaff())) return { success: false, error: "沒有權限" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ai_tutor_grant_by_email", {
    p_email: parsed.data,
  });
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "找不到這個電郵的帳號，請對方先在網站註冊" };

  revalidatePath("/admin/ai-tutor");
  return { success: true };
}

export async function adminRevokeTutorAccess(profileId: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: "沒有權限" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_tutor_members")
    .delete()
    .eq("profile_id", profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/ai-tutor");
  return { success: true };
}

const reviewSchema = z.object({
  messageId: z.string().uuid(),
  status: z.enum(["approved", "needs_correction"]),
  note: z.string().trim().max(2000).optional(),
});

export async function adminReviewTutorAnswer(
  input: z.input<typeof reviewSchema>,
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "資料無效" };
  const staff = await requireStaff();
  if (!staff) return { success: false, error: "沒有權限" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_tutor_messages")
    .update({
      review_status: parsed.data.status,
      reviewer_note: parsed.data.note || null,
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.messageId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/ai-tutor");
  revalidatePath("/tutor");
  return { success: true };
}
