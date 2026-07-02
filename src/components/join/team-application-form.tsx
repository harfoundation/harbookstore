"use client";

import { useState } from "react";
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
import { submitTeamApplication } from "@/lib/actions/team-applications";

export function TeamApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [applicationType, setApplicationType] = useState<"volunteer" | "paid_staff">(
    "volunteer",
  );
  const [roleInterest, setRoleInterest] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">感謝您的申請！</p>
        <p className="text-muted-foreground mt-1 text-sm">我們會盡快與您聯絡。</p>
      </div>
    );
  }

  async function handleSubmit() {
    if (!fullName.trim() || !contactEmail.trim()) {
      toast.error("請填寫姓名與電郵");
      return;
    }
    setSubmitting(true);
    const result = await submitTeamApplication({
      fullName,
      contactEmail,
      contactPhone: contactPhone || undefined,
      applicationType,
      roleInterest: roleInterest || undefined,
      message: message || undefined,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>姓名</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>電郵</Label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>電話（選填）</Label>
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>申請類型</Label>
        <Select
          items={{ volunteer: "志工／義工", paid_staff: "受薪同工" }}
          value={applicationType}
          onValueChange={(v) => setApplicationType(v as typeof applicationType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volunteer">志工／義工</SelectItem>
            <SelectItem value="paid_staff">受薪同工</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>有興趣的崗位（選填）</Label>
        <Input
          value={roleInterest}
          onChange={(e) => setRoleInterest(e.target.value)}
          placeholder="例如：課程助教、書籍採購、活動策劃……"
        />
      </div>
      <div className="space-y-1.5">
        <Label>自我介紹 / 想對我們說的話（選填）</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button className="w-full" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "送出申請"}
      </Button>
    </div>
  );
}
