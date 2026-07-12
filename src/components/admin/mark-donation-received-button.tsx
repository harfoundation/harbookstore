"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markDonationReceived } from "@/lib/actions/donations";

export function MarkDonationReceivedButton({
  pledgeId,
  received,
}: {
  pledgeId: string;
  received: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={received ? "outline" : "default"}
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await markDonationReceived(pledgeId, !received);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success(received ? "已標記為未收款" : "已標記為已收款");
        });
      }}
    >
      {received ? "取消確認" : "確認收款"}
    </Button>
  );
}
