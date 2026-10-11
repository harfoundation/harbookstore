import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { TutorMarkdown, TutorSourceList } from "@/components/ai-tutor/tutor-markdown";
import {
  GrantTutorAccessForm,
  RevokeTutorAccessButton,
  ReviewTutorAnswerForm,
} from "@/components/admin/ai-tutor-admin-forms";
import type { TutorSource } from "@/lib/ai-tutor/tutor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "HAR AI 神學導師管理" };

const STATUS_LABEL: Record<string, string> = {
  pending: "待審閱",
  approved: "正確",
  needs_correction: "需修正",
};

const LICENSE_LABEL: Record<string, string> = {
  public_domain: "公版",
  licensed: "已授權",
  own_work: "自有講義",
};

// Opus 5.5 list price (USD per million tokens), for a rough running total.
const USD_PER_M_INPUT = 4;
const USD_PER_M_OUTPUT = 20;

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminAiTutorPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const supabase = await createClient();

  const [{ data: members }, { data: sources }, { data: answers }, { data: usage }] =
    await Promise.all([
      supabase
        .from("ai_tutor_members")
        .select(
          "profile_id, created_at, profiles!ai_tutor_members_profile_id_fkey(display_name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("theology_sources")
        .select("id, title, author, kind, license, theology_chunks(count)")
        .order("created_at"),
      supabase
        .from("ai_tutor_messages")
        .select(
          "id, conversation_id, content, sources, review_status, reviewer_note, created_at, ai_tutor_conversations!inner(title, profiles(display_name))",
        )
        .eq("role", "assistant")
        .eq("review_status", status)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("ai_tutor_messages")
        .select("input_tokens, output_tokens")
        .eq("role", "assistant")
        .gte("created_at", daysAgoIso(30)),
    ]);

  // The question each answer responds to = the user message just before it.
  const conversationIds = [...new Set((answers ?? []).map((a) => a.conversation_id))];
  const { data: questions } = conversationIds.length
    ? await supabase
        .from("ai_tutor_messages")
        .select("conversation_id, content, created_at")
        .eq("role", "user")
        .in("conversation_id", conversationIds)
        .order("created_at")
    : { data: [] };
  const questionFor = (conversationId: string, answeredAt: string) =>
    (questions ?? [])
      .filter((q) => q.conversation_id === conversationId && q.created_at < answeredAt)
      .at(-1)?.content;

  const inputTokens = (usage ?? []).reduce((sum, u) => sum + (u.input_tokens ?? 0), 0);
  const outputTokens = (usage ?? []).reduce((sum, u) => sum + (u.output_tokens ?? 0), 0);
  const estUsd =
    (inputTokens * USD_PER_M_INPUT + outputTokens * USD_PER_M_OUTPUT) / 1_000_000;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-bold">HAR AI 神學導師</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          近 30 天：{(usage ?? []).length} 個回答，估計費用約 US${estUsd.toFixed(2)}
          （按官方標價粗算，未計快取折扣）。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">學員開通（試點邀請制）</h2>
        <GrantTutorAccessForm />
        <ul className="divide-y rounded-lg border text-sm">
          {(members ?? []).map((m) => (
            <li
              key={m.profile_id}
              className="flex items-center justify-between px-3 py-1.5"
            >
              <span>{m.profiles?.display_name ?? "（未設定名稱）"}</span>
              <RevokeTutorAccessButton profileId={m.profile_id} />
            </li>
          ))}
          {(members ?? []).length === 0 && (
            <li className="text-muted-foreground px-3 py-2">
              尚未開通任何學員。同工帳號可直接使用。
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">文獻庫</h2>
        <p className="text-muted-foreground text-xs">
          只收公版、已取得授權或自有的教學資料。牧養記錄、輔導內容等敏感資料只放在內部筆記本，不可匯入此處。
        </p>
        <ul className="divide-y rounded-lg border text-sm">
          {(sources ?? []).map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 px-3 py-1.5"
            >
              <span>
                {s.title}
                {s.author && <span className="text-muted-foreground"> · {s.author}</span>}
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">{LICENSE_LABEL[s.license]}</Badge>
                <span className="text-muted-foreground text-xs">
                  {s.theology_chunks[0]?.count ?? 0} 段
                </span>
              </span>
            </li>
          ))}
          {(sources ?? []).length === 0 && (
            <li className="text-muted-foreground px-3 py-2">
              文獻庫是空的，請先匯入資料。
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">回答審閱</h2>
          <nav className="flex gap-2 text-sm">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <a
                key={key}
                href={`/admin/ai-tutor?status=${key}`}
                className={`rounded px-2 py-0.5 ${key === status ? "bg-muted font-medium" : "hover:bg-muted"}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        {(answers ?? []).map((a) => (
          <div key={a.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                {a.ai_tutor_conversations.profiles?.display_name ?? "學員"} ·{" "}
                {new Date(a.created_at).toLocaleString("zh-TW")}
              </p>
              <Badge variant={a.review_status === "pending" ? "default" : "secondary"}>
                {STATUS_LABEL[a.review_status]}
              </Badge>
            </div>
            <p className="text-sm font-medium">
              Q：
              {questionFor(a.conversation_id, a.created_at) ??
                a.ai_tutor_conversations.title}
            </p>
            <div className="bg-muted/40 rounded p-3">
              <TutorMarkdown>{a.content}</TutorMarkdown>
              <TutorSourceList sources={(a.sources as TutorSource[] | null) ?? []} />
            </div>
            <ReviewTutorAnswerForm messageId={a.id} initialNote={a.reviewer_note} />
          </div>
        ))}
        {(answers ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            沒有{STATUS_LABEL[status] ?? ""}的回答。
          </p>
        )}
      </section>
    </div>
  );
}
