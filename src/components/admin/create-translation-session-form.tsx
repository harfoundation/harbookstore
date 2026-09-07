"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTranslationSession } from "@/lib/actions/live-translate";
import { LANGUAGES } from "@/lib/translation/languages";

export function CreateTranslationSessionForm({
  branches,
}: {
  branches: { id: string; suburb: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("主日查經");
  const [sourceLang, setSourceLang] = useState<string>("en-US");
  const [targetLang, setTargetLang] = useState<string>("zh-HK");
  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? "none");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>場次名稱</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>分店</Label>
        <Select
          items={{
            none: "（未指定）",
            ...Object.fromEntries(branches.map((b) => [b.id, b.suburb])),
          }}
          value={branchId}
          onValueChange={(v) => setBranchId(v ?? "none")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">（未指定）</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.suburb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>講者語言（來源）</Label>
        <Select
          items={Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]))}
          value={sourceLang}
          onValueChange={(v) => setSourceLang(v ?? "en-US")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>翻譯語言（目標）</Label>
        <Select
          items={Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]))}
          value={targetLang}
          onValueChange={(v) => setTargetLang(v ?? "zh-HK")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        className="sm:col-span-2"
        disabled={submitting || !title.trim() || sourceLang === targetLang}
        onClick={async () => {
          setSubmitting(true);
          const result = await createTranslationSession({
            title: title.trim(),
            sourceLang,
            targetLang,
            branchId: branchId === "none" ? null : branchId,
          });
          setSubmitting(false);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          router.push(`/admin/live-translate/${result.sessionId}`);
        }}
      >
        {submitting ? "建立中…" : "開始新場次"}
      </Button>
      {sourceLang === targetLang && (
        <p className="text-destructive text-sm sm:col-span-2">來源與目標語言不可相同</p>
      )}
    </div>
  );
}
