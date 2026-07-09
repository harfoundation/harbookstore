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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertSettlementResource } from "@/lib/actions/settlement";
import type { SettlementResourceFormInput } from "@/lib/validation/settlement.schema";

type SettlementResource = {
  id: string;
  category: string;
  title_zh: string;
  title_en: string;
  body_markdown_zh: string;
  body_markdown_en: string;
  sort_order: number;
  status: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  housing: "買租房安家 Housing",
  business: "創業做生意 Business",
  employment_study: "學習就業 Study & Employment",
};

const STATUS_LABELS: Record<string, string> = { draft: "草稿", published: "已發布" };

const EMPTY: SettlementResourceFormInput = {
  category: "housing",
  titleZh: "",
  titleEn: "",
  bodyMarkdownZh: "",
  bodyMarkdownEn: "",
  sortOrder: 0,
  status: "draft",
};

export function SettlementResourceFormDialog({
  resource,
  trigger,
}: {
  resource?: SettlementResource;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<SettlementResourceFormInput>(
    resource
      ? {
          id: resource.id,
          category: resource.category as SettlementResourceFormInput["category"],
          titleZh: resource.title_zh,
          titleEn: resource.title_en,
          bodyMarkdownZh: resource.body_markdown_zh,
          bodyMarkdownEn: resource.body_markdown_en,
          sortOrder: resource.sort_order,
          status: resource.status as SettlementResourceFormInput["status"],
        }
      : EMPTY,
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertSettlementResource(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(resource ? "已更新資源" : "已新增資源");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{resource ? "編輯安家資源" : "新增安家資源"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>分類 Category</Label>
            <Select
              items={CATEGORY_LABELS}
              value={form.category}
              onValueChange={(v) =>
                v && setForm({ ...form, category: v as SettlementResourceFormInput["category"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>標題（中文）</Label>
              <Input
                value={form.titleZh}
                onChange={(e) => setForm({ ...form, titleZh: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Title (English)</Label>
              <Input
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>內容（中文，Markdown）</Label>
            <Textarea
              className="min-h-40 font-mono text-sm"
              value={form.bodyMarkdownZh}
              onChange={(e) => setForm({ ...form, bodyMarkdownZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Content (English, Markdown)</Label>
            <Textarea
              className="min-h-40 font-mono text-sm"
              value={form.bodyMarkdownEn}
              onChange={(e) => setForm({ ...form, bodyMarkdownEn: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>排序</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>狀態</Label>
              <Select
                items={STATUS_LABELS}
                value={form.status}
                onValueChange={(v) =>
                  v && setForm({ ...form, status: v as SettlementResourceFormInput["status"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已發布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "儲存中…" : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
