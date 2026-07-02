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
import { upsertArticle } from "@/lib/actions/articles";
import type { ArticleFormInput } from "@/lib/validation/article.schema";

type Article = {
  id: string;
  title: string;
  slug: string;
  body_markdown: string;
  related_category_id: string | null;
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已發布",
  archived: "已封存",
};

export function ArticleFormDialog({
  article,
  categories,
  trigger,
}: {
  article?: Article;
  categories: { id: string; name_zh: string }[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ArticleFormInput>(
    article
      ? {
          id: article.id,
          title: article.title,
          slug: article.slug,
          bodyMarkdown: article.body_markdown,
          relatedBookId: null,
          relatedCategoryId: article.related_category_id,
          status: article.status as ArticleFormInput["status"],
        }
      : {
          title: "",
          slug: "",
          bodyMarkdown: "",
          relatedBookId: null,
          relatedCategoryId: null,
          status: "draft",
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertArticle(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(article ? "已更新文章" : "已新增文章");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{article ? "編輯文章" : "新增文章"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>標題</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>網址代稱（slug，僅限小寫英數與連字號）</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>內容（Markdown）</Label>
            <Textarea
              className="min-h-64 font-mono text-sm"
              value={form.bodyMarkdown}
              onChange={(e) => setForm({ ...form, bodyMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>相關書單分類</Label>
            <Select
              items={{
                none: "（無）",
                ...Object.fromEntries(categories.map((c) => [c.id, c.name_zh])),
              }}
              value={form.relatedCategoryId ?? "none"}
              onValueChange={(v) =>
                setForm({ ...form, relatedCategoryId: v === "none" ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">（無）</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_zh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>狀態</Label>
            <Select
              items={STATUS_LABELS}
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as ArticleFormInput["status"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">已發布</SelectItem>
                <SelectItem value="archived">已封存</SelectItem>
              </SelectContent>
            </Select>
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
