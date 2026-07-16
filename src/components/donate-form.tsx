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
import { submitDonationPledge } from "@/lib/actions/donations";
import { JoinWhatsappCommunityButton } from "@/components/join-whatsapp-community-button";

const PRESET_AMOUNTS = [20, 50, 100, 200];

export function DonateForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [donorName, setDonorName] = useState(defaultName);
  const [donorEmail, setDonorEmail] = useState(defaultEmail);
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [purposeNote, setPurposeNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "in_person">(
    "bank_transfer",
  );
  const [submitting, setSubmitting] = useState(false);
  const [pledgeNumber, setPledgeNumber] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) || null : amount;

  async function handleSubmit() {
    if (!donorName.trim()) {
      toast.error("請填寫姓名");
      return;
    }
    setSubmitting(true);
    const result = await submitDonationPledge({
      donorName,
      donorEmail: donorEmail || undefined,
      donorPhone: donorPhone || undefined,
      amountCents: effectiveAmount != null ? Math.round(effectiveAmount * 100) : null,
      purposeNote: purposeNote || undefined,
      paymentMethod,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setPledgeNumber(result.pledgeNumber);
  }

  if (pledgeNumber) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold">感謝您的奉獻意願！</h1>
        <p className="text-muted-foreground">奉獻編號：{pledgeNumber}</p>
        <div className="rounded-lg border p-4 text-left text-sm">
          <p className="font-medium">銀行轉帳詳情</p>
          <p className="text-muted-foreground mt-1">
            我們會盡快透過您留下的聯絡方式，提供銀行轉帳資訊。完成轉帳後，工作人員將手動確認收款。
          </p>
        </div>
        <div className="flex justify-center pt-1">
          <JoinWhatsappCommunityButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">奉獻支持山書坊</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          您的奉獻將用於支持課程、書評、團購贈書與免費借閱等事工，也包括日常營運開支（如同工薪資），款項使用透明化公開。此為公益意向表單，我們不會直接收取線上付款——送出後，工作人員會與您聯繫安排轉帳或現金奉獻。
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>姓名</Label>
        <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>電郵（選填）</Label>
          <Input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>電話（選填）</Label>
          <Input value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>奉獻金額（澳幣，選填）</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset && !customAmount ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
            >
              ${preset}
            </Button>
          ))}
          <Input
            type="number"
            min={0}
            placeholder="自訂金額"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-28"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>付款方式</Label>
        <Select
          items={{ bank_transfer: "銀行轉帳", in_person: "親臨繳付" }}
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">銀行轉帳</SelectItem>
            <SelectItem value="in_person">親臨繳付</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>留言（選填）</Label>
        <Textarea
          value={purposeNote}
          onChange={(e) => setPurposeNote(e.target.value)}
          placeholder="想指定用途，或想對我們說的話"
        />
      </div>

      <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "送出奉獻意向"}
      </Button>
    </div>
  );
}
