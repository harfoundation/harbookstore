"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGrantTutorAccess,
  adminReviewTutorAnswer,
  adminRevokeTutorAccess,
} from "@/lib/actions/ai-tutor";

export function GrantTutorAccessForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Input
        type="email"
        placeholder="學員註冊用的電郵"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-72"
      />
      <Button
        disabled={isPending || !email.trim()}
        onClick={() =>
          startTransition(async () => {
            const result = await adminGrantTutorAccess(email);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setEmail("");
            toast.success("已開通，請把 /tutor 連結發給學員");
          })
        }
      >
        開通
      </Button>
    </div>
  );
}

export function RevokeTutorAccessButton({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await adminRevokeTutorAccess(profileId);
          if (!result.success) toast.error(result.error);
        })
      }
    >
      移除
    </Button>
  );
}

export function ReviewTutorAnswerForm({
  messageId,
  initialNote,
}: {
  messageId: string;
  initialNote: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [isPending, startTransition] = useTransition();
  const review = (status: "approved" | "needs_correction") =>
    startTransition(async () => {
      const result = await adminReviewTutorAnswer({ messageId, status, note });
      if (!result.success) toast.error(result.error);
      else
        toast.success(
          status === "approved" ? "已標記為正確" : "已標記需修正，學員會看到批註",
        );
    });

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="批註（選填；標記「需修正」時學員會看到）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-16 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => review("approved")}>
          正確
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => review("needs_correction")}
        >
          需修正
        </Button>
      </div>
    </div>
  );
}
