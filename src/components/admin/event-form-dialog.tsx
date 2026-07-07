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
import { upsertEvent } from "@/lib/actions/events";
import type { EventFormInput } from "@/lib/validation/event.schema";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  body_markdown: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  poster_image_url: string | null;
  status: string;
};

const STATUS_LABELS: Record<string, string> = { draft: "草稿", published: "已發布" };

export function EventFormDialog({
  event,
  trigger,
}: {
  event?: Event;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<EventFormInput>(
    event
      ? {
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description ?? "",
          bodyMarkdown: event.body_markdown ?? "",
          eventDate: event.event_date,
          eventTime: event.event_time ?? "",
          location: event.location ?? "",
          posterImageUrl: event.poster_image_url ?? "",
          status: event.status as EventFormInput["status"],
        }
      : {
          title: "",
          slug: "",
          description: "",
          bodyMarkdown: "",
          eventDate: "",
          eventTime: "",
          location: "",
          posterImageUrl: "",
          status: "draft",
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertEvent(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(event ? "已更新活動" : "已新增活動");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? "編輯活動公告" : "新增活動公告"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>活動名稱</Label>
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
            <Label>簡短介紹（選填）</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>日期</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>時間（選填）</Label>
              <Input
                placeholder="例如 2PM"
                value={form.eventTime}
                onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>地點（選填）</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>海報圖片網址（選填）</Label>
            <Input
              value={form.posterImageUrl}
              onChange={(e) => setForm({ ...form, posterImageUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>詳細內容（Markdown，選填）</Label>
            <Textarea
              className="min-h-32 font-mono text-sm"
              value={form.bodyMarkdown}
              onChange={(e) => setForm({ ...form, bodyMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>狀態</Label>
            <Select
              items={STATUS_LABELS}
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as EventFormInput["status"] })
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
