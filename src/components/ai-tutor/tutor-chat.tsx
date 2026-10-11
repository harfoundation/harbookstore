"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askTutor } from "@/lib/actions/ai-tutor";
import { TutorMarkdown, TutorSourceList } from "@/components/ai-tutor/tutor-markdown";
import { EXAMPLE_QUESTIONS } from "@/lib/ai-tutor/examples";

export type TutorChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: { id: number; source_title: string; ref_label: string }[];
  reviewStatus?: "pending" | "approved" | "needs_correction";
  reviewerNote?: string | null;
};

export function TutorChat({
  conversationId: initialConversationId,
  initialMessages,
  demo,
}: {
  conversationId?: string;
  initialMessages: TutorChatMessage[];
  demo: boolean;
}) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `pending-${Date.now()}`, role: "user", content: trimmed, sources: [] },
    ]);
    setQuestion("");
    startTransition(async () => {
      const result = await askTutor({ conversationId, question: trimmed });
      if (!result.success) {
        toast.error(result.error);
        setMessages((prev) => prev.slice(0, -1));
        setQuestion(trimmed);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: result.answer.id,
          role: "assistant",
          content: result.answer.content,
          sources: result.answer.sources,
          reviewStatus: "pending",
        },
      ]);
      if (!conversationId) {
        setConversationId(result.conversationId);
        router.replace(`/tutor?c=${result.conversationId}`, { scroll: false });
      }
    });
  };

  return (
    <div className="space-y-4">
      {demo && (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs dark:border-amber-700 dark:bg-amber-950">
          演示模式：AI
          尚未接通。下面三個示範問題有預先準備的回答；其他問題會列出文獻庫的檢索結果。
        </p>
      )}
      {messages.length === 0 && (
        <div className="space-y-2 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground text-sm">可以這樣開始：</p>
          <div className="flex flex-col gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isPending}
                onClick={() => submit(q)}
                className="hover:bg-muted rounded border px-3 py-2 text-left text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((m) =>
        m.role === "user" ? (
          <div
            key={m.id}
            className="bg-muted ml-auto max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap"
          >
            {m.content}
          </div>
        ) : (
          <div key={m.id} className="rounded-lg border p-4">
            <TutorMarkdown>{m.content}</TutorMarkdown>
            <TutorSourceList sources={m.sources} />
            {m.reviewStatus === "approved" && (
              <p className="mt-3 text-xs text-green-700 dark:text-green-400">
                ✓ 牧師已審閱
              </p>
            )}
            {m.reviewStatus === "needs_correction" && (
              <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs dark:border-amber-700 dark:bg-amber-950">
                <p className="font-semibold">牧師批註：這個回答需要修正</p>
                {m.reviewerNote && (
                  <p className="mt-1 whitespace-pre-wrap">{m.reviewerNote}</p>
                )}
              </div>
            )}
          </div>
        ),
      )}

      {isPending && (
        <p className="text-muted-foreground animate-pulse text-sm">
          正在查閱文獻並整理回答，通常需要 20–60 秒……
        </p>
      )}

      <div className="space-y-2">
        <Textarea
          placeholder="輸入你的問題，例如某段經文的意思、某個教義、不同神學家的觀點……"
          value={question}
          maxLength={2000}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(question);
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            AI
            的回答僅供學習參考，不能取代聖經原意或教會的教導；請以經文和授課牧師的指導為準。
          </p>
          <Button
            disabled={isPending || !question.trim()}
            onClick={() => submit(question)}
          >
            提問
          </Button>
        </div>
      </div>
    </div>
  );
}
