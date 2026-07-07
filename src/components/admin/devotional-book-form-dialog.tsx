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
import { upsertDevotionalBook } from "@/lib/actions/devotionals";
import type { DevotionalBookFormInput } from "@/lib/validation/devotional.schema";

type Book = {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string | null;
  author_name: string | null;
  author_bio_markdown: string | null;
  declaration_markdown: string | null;
  preface_markdown: string | null;
  afterword_markdown: string | null;
  topic_index: string[];
  status: string;
};

const STATUS_LABELS: Record<string, string> = { draft: "草稿", published: "已發布" };

export function DevotionalBookFormDialog({
  book,
  trigger,
}: {
  book?: Book;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DevotionalBookFormInput>(
    book
      ? {
          id: book.id,
          slug: book.slug,
          titleZh: book.title_zh,
          titleEn: book.title_en ?? "",
          authorName: book.author_name ?? "",
          authorBioMarkdown: book.author_bio_markdown ?? "",
          declarationMarkdown: book.declaration_markdown ?? "",
          prefaceMarkdown: book.preface_markdown ?? "",
          afterwordMarkdown: book.afterword_markdown ?? "",
          topicIndex: book.topic_index,
          status: book.status as DevotionalBookFormInput["status"],
        }
      : {
          slug: "",
          titleZh: "",
          titleEn: "",
          authorName: "",
          authorBioMarkdown: "",
          declarationMarkdown: "",
          prefaceMarkdown: "",
          afterwordMarkdown: "",
          topicIndex: [],
          status: "draft",
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertDevotionalBook(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(book ? "已更新書籍" : "已新增書籍");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{book ? "編輯書籍" : "新增書籍"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>書名（中文）</Label>
            <Input
              value={form.titleZh}
              onChange={(e) => setForm({ ...form, titleZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>書名（英文）</Label>
            <Input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
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
            <Label>作者</Label>
            <Input
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>作者簡介（Markdown）</Label>
            <Textarea
              className="min-h-24 font-mono text-sm"
              value={form.authorBioMarkdown}
              onChange={(e) => setForm({ ...form, authorBioMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>聲明（Markdown）</Label>
            <Textarea
              className="min-h-24 font-mono text-sm"
              value={form.declarationMarkdown}
              onChange={(e) => setForm({ ...form, declarationMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>序言（Markdown）</Label>
            <Textarea
              className="min-h-32 font-mono text-sm"
              value={form.prefaceMarkdown}
              onChange={(e) => setForm({ ...form, prefaceMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>後記（Markdown）</Label>
            <Textarea
              className="min-h-32 font-mono text-sm"
              value={form.afterwordMarkdown}
              onChange={(e) => setForm({ ...form, afterwordMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>主題索引（以逗號分隔）</Label>
            <Input
              value={form.topicIndex.join("、")}
              onChange={(e) =>
                setForm({
                  ...form,
                  topicIndex: e.target.value
                    .split(/[,、]/)
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>狀態</Label>
            <Select
              items={STATUS_LABELS}
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as DevotionalBookFormInput["status"] })
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

        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "儲存中…" : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
