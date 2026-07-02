"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminRespondToQuestion } from "@/lib/actions/reader-questions";

export function ReaderQuestionRespondForm({
  questionId,
  initialResponse,
}: {
  questionId: string;
  initialResponse: string | null;
}) {
  const [response, setResponse] = useState(initialResponse ?? "");
  const [isPending, startTransition] = useTransition();

  function respond(status: "answered_private" | "answered_public" | "declined") {
    if (status !== "declined" && !response.trim()) {
      toast.error("請輸入回覆內容");
      return;
    }
    startTransition(async () => {
      const result = await adminRespondToQuestion({
        questionId,
        adminResponseBody: response || "（已婉拒回覆）",
        status,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("已更新");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="輸入回覆內容……"
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => respond("answered_public")}>
          公開回覆
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => respond("answered_private")}
        >
          私下回覆
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => respond("declined")}
        >
          婉拒
        </Button>
      </div>
    </div>
  );
}
