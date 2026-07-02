import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ReaderQuestionRespondForm } from "@/components/admin/reader-question-respond-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "人生解惑管理" };

const STATUS_LABEL: Record<string, string> = {
  pending: "待處理",
  answered_private: "已私下回覆",
  answered_public: "已公開回覆",
  declined: "已婉拒",
};

export default async function AdminReaderQuestionsPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("reader_questions")
    .select(
      "id, question_body, submitter_display_name, is_anonymous, status, admin_response_body, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">人生解惑提問管理</h1>

      <div className="space-y-4">
        {(questions ?? []).map((q) => (
          <div key={q.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                {q.is_anonymous ? "匿名" : (q.submitter_display_name ?? "未具名")} ·{" "}
                {new Date(q.created_at).toLocaleString("zh-TW")}
              </p>
              <Badge variant={q.status === "pending" ? "default" : "secondary"}>
                {STATUS_LABEL[q.status]}
              </Badge>
            </div>
            <p className="text-sm font-medium">{q.question_body}</p>
            <ReaderQuestionRespondForm
              questionId={q.id}
              initialResponse={q.admin_response_body}
            />
          </div>
        ))}
        {(questions ?? []).length === 0 && (
          <p className="text-muted-foreground">目前沒有提問。</p>
        )}
      </div>
    </div>
  );
}
