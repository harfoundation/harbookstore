"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelBorrowRequest } from "@/lib/actions/borrow-requests";

export function CancelBorrowRequestButton({
  borrowRequestId,
}: {
  borrowRequestId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await cancelBorrowRequest(borrowRequestId);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已取消借閱申請");
        });
      }}
    >
      取消申請
    </Button>
  );
}
