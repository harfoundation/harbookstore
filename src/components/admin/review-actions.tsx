"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReviewActions({
  onReview,
}: {
  onReview: (
    decision: "approved" | "rejected",
    notes?: string,
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handle(decision: "approved" | "rejected") {
    startTransition(async () => {
      const result = await onReview(decision, notes || undefined);
      if (!result.success) {
        toast.error(result.error ?? "操作失敗");
        return;
      }
      toast.success(decision === "approved" ? "已核准並上架" : "已拒絕");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="審核備註（選填）"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border-input h-7 w-40 rounded-md border bg-transparent px-2 text-xs"
      />
      <Button size="sm" disabled={isPending} onClick={() => handle("approved")}>
        核准
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => handle("rejected")}
      >
        拒絕
      </Button>
    </div>
  );
}
