"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { postCourseQa } from "@/lib/actions/courses";

type QaMessage = {
  id: string;
  body: string;
  is_instructor_reply: boolean;
  created_at: string;
  author: { display_name: string | null } | null;
};

export function CourseQaWall({
  courseId,
  lessonId,
  messages,
  isLoggedIn,
}: {
  courseId: string;
  lessonId?: string;
  messages: QaMessage[];
  isLoggedIn: boolean;
}) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">講師在線答疑牆</h2>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">目前還沒有提問，歡迎率先發問！</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium">
                {m.author?.display_name ?? "匿名"}
              </span>
              {m.is_instructor_reply && <Badge>講師</Badge>}
              <span className="text-muted-foreground text-xs">
                {new Date(m.created_at).toLocaleString("zh-TW")}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder={isLoggedIn ? "在此輸入您的提問……" : "請先登入才能發問"}
          value={body}
          disabled={!isLoggedIn}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          disabled={!isLoggedIn || isPending || !body.trim()}
          onClick={() => {
            startTransition(async () => {
              const result = await postCourseQa({ courseId, lessonId, body });
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              setBody("");
              toast.success("已送出提問");
            });
          }}
        >
          送出提問
        </Button>
      </div>
    </div>
  );
}
