"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { claimDutyShift, releaseDutyShift } from "@/lib/actions/duty-shifts";

export function DutyShiftCard({
  shiftId,
  dateLabel,
  timeLabel,
  branchLabel,
  assigneeName,
  isMine,
  notes,
}: {
  shiftId: string;
  dateLabel: string;
  timeLabel: string;
  branchLabel: string | null;
  assigneeName: string | null;
  isMine: boolean;
  notes: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTaken, setOptimisticTaken] = useState(!!assigneeName);

  const taken = optimisticTaken || !!assigneeName;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="space-y-1">
          <p className="font-medium">
            {dateLabel} {timeLabel}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {branchLabel && <Badge variant="secondary">{branchLabel}</Badge>}
            {taken ? (
              <span className={isMine ? "font-medium" : "text-muted-foreground"}>
                {isMine ? "由你認領" : `已由 ${assigneeName ?? "同工"} 認領`}
              </span>
            ) : (
              <span className="text-muted-foreground">尚未認領</span>
            )}
          </div>
          {notes && <p className="text-muted-foreground text-sm">{notes}</p>}
        </div>

        {isMine ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await releaseDutyShift(shiftId);
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setOptimisticTaken(false);
                toast.success("已取消認領");
              });
            }}
          >
            取消認領
          </Button>
        ) : !taken ? (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await claimDutyShift(shiftId);
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setOptimisticTaken(true);
                toast.success("已認領此班次");
              });
            }}
          >
            認領此班次
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
