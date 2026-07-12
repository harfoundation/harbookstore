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
import { referMember } from "@/lib/actions/member-referrals";
import { getWhatsappShareLink } from "@/lib/whatsapp";

export function ReferMemberButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [referredName, setReferredName] = useState("");
  const [referredContact, setReferredContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!referredName.trim()) {
      toast.error("請填寫朋友的名字");
      return;
    }
    setSubmitting(true);
    const result = await referMember({
      referredName,
      referredContact: referredContact || undefined,
      message: message || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const shareText = message
      ? `我想邀請你加入山書坊！\n\n${message}\n\n${window.location.origin}/signup`
      : `我想邀請你加入山書坊——一起讀書、成長：${window.location.origin}/signup`;
    window.open(getWhatsappShareLink(shareText), "_blank");

    toast.success("已記錄推薦，WhatsApp 邀請視窗已開啟");
    setOpen(false);
    setReferredName("");
    setReferredContact("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                toast.error("請先登入才能推薦朋友");
              }
            }}
          />
        }
      >
        推薦朋友加入
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>推薦朋友加入山書坊</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>朋友的名字</Label>
            <Input
              value={referredName}
              onChange={(e) => setReferredName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>聯絡方式（選填）</Label>
            <Input
              value={referredContact}
              onChange={(e) => setReferredContact(e.target.value)}
              placeholder="電郵或電話"
            />
          </div>
          <div className="space-y-1.5">
            <Label>想對他說的話（選填）</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="為什麼想邀請他加入？"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            送出後會開啟 WhatsApp，讓您把邀請分享給朋友。
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
