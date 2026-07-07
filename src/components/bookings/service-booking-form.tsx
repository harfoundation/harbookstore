"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitServiceBooking } from "@/lib/actions/bookings";

export function ServiceBookingForm({
  serviceId,
  defaultName,
  defaultEmail,
}: {
  serviceId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [customerName, setCustomerName] = useState(defaultName ?? "");
  const [customerEmail, setCustomerEmail] = useState(defaultEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [partySize, setPartySize] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!customerName.trim() || !customerEmail.trim() || !preferredDate) {
      toast.error("請填寫姓名、電郵與希望日期");
      return;
    }
    startTransition(async () => {
      const result = await submitServiceBooking({
        serviceId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        partySize: partySize ? Number(partySize) : undefined,
        preferredDate,
        preferredTime: preferredTime || undefined,
        notes: notes || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("已送出預約申請，請留意電郵確認");
      setCustomerPhone("");
      setPartySize("");
      setPreferredDate("");
      setPreferredTime("");
      setNotes("");
    });
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>姓名</Label>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>電郵</Label>
          <Input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>電話（選填）</Label>
          <Input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>人數（選填）</Label>
          <Input
            type="number"
            min={1}
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>希望日期</Label>
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>希望時段（選填）</Label>
          <Input
            placeholder="例如 14:00–16:00"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>備註（選填）</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button disabled={isPending} onClick={handleSubmit}>
        {isPending ? "送出中…" : "送出預約申請"}
      </Button>
    </div>
  );
}
