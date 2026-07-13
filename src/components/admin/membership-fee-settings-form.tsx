"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMembershipFeeSettings } from "@/lib/actions/membership";

export function MembershipFeeSettingsForm({
  feeCents,
  usageNote,
}: {
  feeCents: number | null;
  usageNote: string | null;
}) {
  const [feeInput, setFeeInput] = useState(
    feeCents != null ? String(feeCents / 100) : "",
  );
  const [note, setNote] = useState(usageNote ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">會員年費設定</h2>
      <div className="space-y-1.5">
        <Label>會員年費（澳幣／年，留空表示尚未公布）</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={feeInput}
          onChange={(e) => setFeeInput(e.target.value)}
          placeholder="例如 30"
        />
      </div>
      <div className="space-y-1.5">
        <Label>費用用途說明（會顯示在公開頁面）</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="說明會員年費將如何使用"
          rows={4}
        />
      </div>
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const feeCents = feeInput.trim()
            ? Math.round(Number(feeInput) * 100)
            : null;
          const result = await updateMembershipFeeSettings({
            feeCents,
            usageNote: note || undefined,
          });
          setSaving(false);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已儲存");
        }}
      >
        {saving ? "儲存中…" : "儲存設定"}
      </Button>
    </div>
  );
}
