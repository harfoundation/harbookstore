"use client";

import { useState, useTransition } from "react";
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
import { submitChurchRegistration } from "@/lib/actions/churches";

const TYPE_LABELS: Record<string, string> = { newcomer: "新朋友", co_worker: "同工" };

export function ChurchRegistrationForm({
  churchId,
  congregations,
}: {
  churchId: string;
  congregations: { id: string; name: string }[];
}) {
  const [registrationType, setRegistrationType] = useState<"newcomer" | "co_worker">(
    "newcomer",
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [congregationId, setCongregationId] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!fullName.trim()) {
      toast.error("請輸入姓名");
      return;
    }
    startTransition(async () => {
      const result = await submitChurchRegistration({
        churchId,
        registrationType,
        fullName,
        phone: phone || undefined,
        email: email || undefined,
        congregationId: congregationId || undefined,
        message: message || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
      toast.success("已送出登記");
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">已收到您的登記，謝謝！</p>
        <p className="text-muted-foreground mt-1 text-sm">同工將盡快與您聯絡。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label>登記類型</Label>
        <Select
          items={TYPE_LABELS}
          value={registrationType}
          onValueChange={(v) => v && setRegistrationType(v as "newcomer" | "co_worker")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>姓名</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>電話（選填）</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>電郵（選填）</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      {congregations.length > 0 && (
        <div className="space-y-1.5">
          <Label>參加堂會（選填）</Label>
          <Select
            items={Object.fromEntries(congregations.map((c) => [c.id, c.name]))}
            value={congregationId}
            onValueChange={(v) => setCongregationId(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="請選擇" />
            </SelectTrigger>
            <SelectContent>
              {congregations.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>留言（選填）</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button disabled={isPending} onClick={handleSubmit}>
        {isPending ? "送出中…" : "送出登記"}
      </Button>
    </div>
  );
}
