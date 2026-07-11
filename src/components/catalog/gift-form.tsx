"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGiftOrder } from "@/lib/actions/orders";

export function GiftForm({
  book,
}: {
  book: { id: string; title: string; price_cents: number | null };
}) {
  const router = useRouter();
  // Raw string state — clamping on every keystroke forces the field back to
  // "1" the instant it's cleared, making it impossible to type a fresh
  // multi-digit number.
  const [quantityInput, setQuantityInput] = useState("1");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [dedicationCardMessage, setDedicationCardMessage] = useState("");
  const [giftDeliveryMethod, setGiftDeliveryMethod] = useState<
    "self_pickup" | "mail" | "digital_card_only"
  >("digital_card_only");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!recipientName.trim()) {
      toast.error("請填寫收禮人姓名");
      return;
    }
    const quantity = Math.max(1, Math.min(10, Math.trunc(Number(quantityInput)) || 1));
    setQuantityInput(String(quantity));
    setSubmitting(true);
    const result = await createGiftOrder({
      bookId: book.id,
      quantity,
      paymentMethod: "bank_transfer",
      recipientName,
      recipientEmail: recipientEmail || undefined,
      recipientAddress: recipientAddress || undefined,
      dedicationCardMessage: dedicationCardMessage || undefined,
      giftDeliveryMethod,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`贈書訂單已建立：${result.orderNumber}`);
    router.push(`/orders?created=${result.orderNumber}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-bold">贈送這本書</h1>
        <p className="text-muted-foreground mt-1">{book.title}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantity">數量</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={10}
          value={quantityInput}
          onChange={(e) => setQuantityInput(e.target.value)}
          onBlur={() =>
            setQuantityInput(
              String(Math.max(1, Math.min(10, Math.trunc(Number(quantityInput)) || 1))),
            )
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recipientName">收禮人姓名</Label>
        <Input
          id="recipientName"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recipientEmail">收禮人電郵（選填）</Label>
        <Input
          id="recipientEmail"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>送達方式</Label>
        <Select
          items={{ digital_card_only: "僅電子代禱卡", self_pickup: "自取", mail: "郵寄" }}
          value={giftDeliveryMethod}
          onValueChange={(v) => setGiftDeliveryMethod(v as typeof giftDeliveryMethod)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="digital_card_only">僅電子代禱卡</SelectItem>
            <SelectItem value="self_pickup">自取</SelectItem>
            <SelectItem value="mail">郵寄</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {giftDeliveryMethod === "mail" && (
        <div className="space-y-1.5">
          <Label htmlFor="recipientAddress">郵寄地址</Label>
          <Textarea
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="dedicationCardMessage">送禮代禱卡文字（選填）</Label>
        <Textarea
          id="dedicationCardMessage"
          placeholder="寫下您想對收禮人說的話或代禱祝福……"
          value={dedicationCardMessage}
          onChange={(e) => setDedicationCardMessage(e.target.value)}
        />
      </div>

      <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "確認贈書"}
      </Button>
    </div>
  );
}
