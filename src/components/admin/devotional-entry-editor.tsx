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
import { upsertDevotionalEntry } from "@/lib/actions/devotionals";
import type { DevotionalEntryFormInput } from "@/lib/validation/devotional.schema";
import { checkChineseText, type LintIssue } from "@/lib/text-lint/check-chinese-text";

const LINT_TYPE_LABELS: Record<LintIssue["type"], string> = {
  punctuation: "標點全形/半形",
  "duplicate-punctuation": "重複標點",
  quotes: "引號格式",
  "duplicate-word": "重複用字",
  spacing: "空格",
};

type Volume = { id: string; volume_number: number; title_zh: string };

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已發布",
  scheduled: "排程中",
};

export function DevotionalEntryEditor({
  bookId,
  volumes,
  entry,
  nextEntryNumber,
}: {
  bookId: string;
  volumes: Volume[];
  entry?: {
    id: string;
    volume_id: string;
    entry_number: number;
    title: string;
    subtitle: string | null;
    body_markdown: string;
    scripture_reference: string | null;
    written_date: string | null;
    status: string;
  };
  nextEntryNumber?: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [lintIssues, setLintIssues] = useState<LintIssue[] | null>(null);
  const [form, setForm] = useState<DevotionalEntryFormInput>(
    entry
      ? {
          id: entry.id,
          bookId,
          volumeId: entry.volume_id,
          entryNumber: entry.entry_number,
          title: entry.title,
          subtitle: entry.subtitle ?? "",
          bodyMarkdown: entry.body_markdown,
          scriptureReference: entry.scripture_reference ?? "",
          writtenDate: entry.written_date ?? "",
          status: entry.status as DevotionalEntryFormInput["status"],
        }
      : {
          bookId,
          volumeId: volumes[0]?.id ?? "",
          entryNumber: nextEntryNumber ?? 1,
          title: "",
          subtitle: "",
          bodyMarkdown: "",
          scriptureReference: "",
          writtenDate: "",
          status: "draft",
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertDevotionalEntry(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(entry ? "已更新篇章" : "已新增篇章");
    router.push(`/admin/devotionals/${bookId}`);
    router.refresh();
  }

  return (
    <div className="space-y-4 pb-24 sm:pb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>卷次</Label>
          <Select
            items={Object.fromEntries(
              volumes.map((v) => [v.id, `第${v.volume_number}卷　${v.title_zh}`]),
            )}
            value={form.volumeId}
            onValueChange={(v) => setForm({ ...form, volumeId: v ?? "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {volumes.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  第{v.volume_number}卷　{v.title_zh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>篇章編號</Label>
          <Input
            type="number"
            value={form.entryNumber}
            onChange={(e) => setForm({ ...form, entryNumber: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>標題</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>副標題（選填，如《答非所問》一類的一句話主旨）</Label>
        <Input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>經文出處</Label>
          <Input
            value={form.scriptureReference}
            onChange={(e) => setForm({ ...form, scriptureReference: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>寫作日期</Label>
          <Input
            type="date"
            value={form.writtenDate}
            onChange={(e) => setForm({ ...form, writtenDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>內容（Markdown）</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLintIssues(checkChineseText(form.bodyMarkdown))}
          >
            檢查文字
          </Button>
        </div>
        <Textarea
          className="min-h-[50vh] text-base leading-relaxed"
          value={form.bodyMarkdown}
          onChange={(e) => {
            setForm({ ...form, bodyMarkdown: e.target.value });
            setLintIssues(null);
          }}
        />
        {lintIssues && (
          <div className="bg-muted/50 space-y-2 rounded-lg border p-3 text-sm">
            <p className="text-muted-foreground text-xs">
              以下為基礎標點、重複字與排版檢查，並非完整文法或錯別字校對，僅供參考。
            </p>
            {lintIssues.length === 0 ? (
              <p className="text-muted-foreground">未發現明顯問題。</p>
            ) : (
              <ul className="space-y-1.5">
                {lintIssues.map((issue, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2">
                    <span className="bg-background rounded border px-1.5 py-0.5 text-xs">
                      {LINT_TYPE_LABELS[issue.type]}
                    </span>
                    <span>{issue.message}</span>
                    <span className="text-muted-foreground">「{issue.excerpt}」</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>狀態</Label>
        <Select
          items={STATUS_LABELS}
          value={form.status}
          onValueChange={(v) =>
            setForm({ ...form, status: v as DevotionalEntryFormInput["status"] })
          }
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="published">已發布</SelectItem>
            <SelectItem value="scheduled">排程中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background/95 fixed inset-x-0 bottom-0 border-t p-3 backdrop-blur sm:static sm:border-0 sm:p-0 sm:backdrop-blur-none">
        <Button disabled={submitting} onClick={handleSubmit} className="w-full sm:w-auto">
          {submitting ? "儲存中…" : "儲存"}
        </Button>
      </div>
    </div>
  );
}
