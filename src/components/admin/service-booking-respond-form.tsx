"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respondToServiceBooking } from "@/lib/actions/bookings";

export function ServiceBookingRespondForm({ bookingId }: { bookingId: string }) {
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();

  function respond(status: "confirmed" | "declined") {
    startTransition(async () => {
      const result = await respondToServiceBooking({
        bookingId,
        status,
        adminReplyMessage: reply || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("已回覆並發送電郵通知");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="回覆訊息（選填，會一併發送到顧客電郵）……"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => respond("confirmed")}>
          確認預約
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => respond("declined")}
        >
          無法安排
        </Button>
      </div>
    </div>
  );
}
