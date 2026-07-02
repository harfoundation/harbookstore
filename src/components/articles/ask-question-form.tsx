"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitReaderQuestion } from "@/lib/actions/reader-questions";

export function AskQuestionForm() {
  const [questionBody, setQuestionBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Textarea
        placeholder="在此輸入您的人生解惑提問……"
        value={questionBody}
        onChange={(e) => setQuestionBody(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          匿名提問
        </label>
        {!isAnonymous && (
          <Input
            placeholder="您的顯示名稱（選填）"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="max-w-48"
          />
        )}
      </div>
      <Button
        disabled={isPending || !questionBody.trim()}
        onClick={() => {
          startTransition(async () => {
            const result = await submitReaderQuestion({
              questionBody,
              submitterDisplayName: displayName || undefined,
              isAnonymous,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setQuestionBody("");
            setDisplayName("");
            toast.success("已送出您的提問，感謝您的信任");
          });
        }}
      >
        送出提問
      </Button>
    </div>
  );
}
