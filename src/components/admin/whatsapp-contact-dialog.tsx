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
import { addWhatsappContact } from "@/lib/actions/whatsapp-contacts";

export function WhatsappContactDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [optIn, setOptIn] = useState(false);

  async function handleSubmit() {
    if (!phoneNumber.trim()) {
      toast.error("請輸入電話號碼");
      return;
    }
    setSubmitting(true);
    const result = await addWhatsappContact({
      phoneNumber,
      displayName: displayName || undefined,
      tags: [],
      optIn,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("已新增聯絡人");
    setPhoneNumber("");
    setDisplayName("");
    setOptIn(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">手動新增</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>新增 WhatsApp 聯絡人</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>電話號碼（含國碼，如 +61...）</Label>
            <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>姓名（選填）</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
            />
            已同意接收通知
          </label>
        </div>
        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "新增中…" : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
