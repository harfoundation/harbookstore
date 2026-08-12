"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { claimDutyShift, releaseDutyShift } from "@/lib/actions/duty-shifts";

export function DutyHourSlot({
  shiftId,
  assigneeName,
  isAssigned,
  isMine,
}: {
  shiftId: string;
  assigneeName: string | null;
  isAssigned: boolean;
  isMine: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTaken, setOptimisticTaken] = useState(isAssigned);

  const taken = optimisticTaken || isAssigned;

  function handleClick() {
    if (isPending) return;
    startTransition(async () => {
      if (isMine) {
        const result = await releaseDutyShift(shiftId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setOptimisticTaken(false);
        toast.success("已取消認領");
        return;
      }
      if (taken) return;
      const result = await claimDutyShift(shiftId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setOptimisticTaken(true);
      toast.success("已認領此班次");
    });
  }

  return (
    <button
      type="button"
      disabled={isPending || (taken && !isMine)}
      onClick={handleClick}
      className={cn(
        "flex w-full min-w-20 items-center justify-center rounded-lg border px-2 py-2 text-center text-xs transition-colors",
        isMine
          ? "border-primary bg-primary/10 hover:bg-primary/15 text-primary font-medium"
          : taken
            ? "bg-muted text-muted-foreground border-transparent"
            : "text-muted-foreground hover:border-primary/50 border-dashed",
        !taken || isMine ? "cursor-pointer" : "cursor-default",
      )}
    >
      {isMine ? "你已認領" : taken ? (assigneeName ?? "同工") : "認領"}
    </button>
  );
}
