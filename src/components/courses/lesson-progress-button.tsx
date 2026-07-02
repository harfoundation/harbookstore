"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setLessonProgress } from "@/lib/actions/courses";

export function LessonProgressButton({
  lessonId,
  initialCompleted,
  isLoggedIn,
}: {
  lessonId: string;
  initialCompleted: boolean;
  isLoggedIn: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={completed ? "secondary" : "default"}
      disabled={isPending}
      onClick={() => {
        if (!isLoggedIn) {
          toast.error("請先登入才能記錄學習進度");
          return;
        }
        startTransition(async () => {
          const result = await setLessonProgress(lessonId, !completed);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          setCompleted(!completed);
          toast.success(!completed ? "已標記完成" : "已取消標記");
        });
      }}
    >
      {completed ? "✓ 已完成此課堂" : "標記為已完成"}
    </Button>
  );
}
