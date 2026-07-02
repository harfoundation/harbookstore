import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AskQuestionForm } from "@/components/articles/ask-question-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "人生解惑" };

export default async function AskPage() {
  const supabase = await createClient();
  const { data: answered } = await supabase
    .from("public_answered_questions")
    .select("id, question_body, admin_response_body, responded_at")
    .order("responded_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">人生解惑</h1>
        <p className="text-muted-foreground mt-1">
          有信仰或人生上的困惑嗎？歡迎匿名向我們提問，書評委員會會盡力回應。
        </p>
      </div>

      <AskQuestionForm />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">社群問答</h2>
        {(answered ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">目前還沒有公開回覆的提問。</p>
        ) : (
          (answered ?? []).map((qa) => (
            <div key={qa.id} className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">Q：{qa.question_body}</p>
              <p className="text-muted-foreground text-sm">A：{qa.admin_response_body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
