"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTeamApplication } from "@/lib/actions/team-applications";

export function BookReviewWriterForm() {
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [roleInterest, setRoleInterest] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">感謝您的報名！</p>
        <p className="text-muted-foreground mt-1 text-sm">
          書評委員會會盡快與您聯絡，一起閱讀、思考、書寫。
        </p>
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
      applicationType: "book_review_writer",
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
    <div className="space-y-4 rounded-lg border p-5">
      <div className="space-y-1.5">
        <Label>姓名</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <Label>有興趣評論的書籍／範疇（選填）</Label>
        <Input
          value={roleInterest}
          onChange={(e) => setRoleInterest(e.target.value)}
          placeholder="例如：起步類、職場信仰類，或指定書名"
        />
      </div>
      <div className="space-y-1.5">
        <Label>寫作經驗 / 想對書評委員會說的話（選填）</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="是否曾寫過書評、閱讀習慣、期望的參與方式等"
        />
      </div>
      <Button className="w-full" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "報名參與書評寫作"}
      </Button>
    </div>
  );
}
