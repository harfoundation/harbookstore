"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recommendBookToFriend } from "@/lib/actions/recommendations";
import { getWhatsappShareLink } from "@/lib/whatsapp";

export function RecommendBookButton({
  bookId,
  bookTitle,
  isLoggedIn,
}: {
  bookId: string;
  bookTitle: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await recommendBookToFriend({
      bookId,
      recipientName: recipientName || undefined,
      message: message || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const shareText = message
      ? `我想推薦你這本書：《${bookTitle}》\n\n${message}\n\n山書坊：${window.location.href}`
      : `我想推薦你這本書：《${bookTitle}》\n\n山書坊：${window.location.href}`;
    window.open(getWhatsappShareLink(shareText), "_blank");

    toast.success("已記錄推薦，WhatsApp 分享視窗已開啟");
    setOpen(false);
    setRecipientName("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                toast.error("請先登入才能推薦書籍");
              }
            }}
          />
        }
      >
        推薦給朋友
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>推薦《{bookTitle}》給朋友</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>朋友的名字（選填）</Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>想對他說的話（選填）</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="為什麼想推薦這本書給他？"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            送出後會開啟 WhatsApp，讓您把推薦分享給朋友。
          </p>
        </div>
        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "送出中…" : "送出並分享到 WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
