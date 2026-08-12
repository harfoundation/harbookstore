"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminAssignDutyShift, deleteDutyShift } from "@/lib/actions/duty-shifts";

export function DutyShiftRowActions({
  shiftId,
  isAssigned,
}: {
  shiftId: string;
  isAssigned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {isAssigned && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await adminAssignDutyShift(shiftId, null);
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              toast.success("已清除認領");
            });
          }}
        >
          清除認領
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          if (!confirm("確定要刪除此班次？")) return;
          startTransition(async () => {
            const result = await deleteDutyShift(shiftId);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("已刪除班次");
          });
        }}
      >
        刪除
      </Button>
    </div>
  );
}
