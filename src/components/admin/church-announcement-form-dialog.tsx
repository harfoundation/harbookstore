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
import { upsertChurchAnnouncement } from "@/lib/actions/churches";
import type { ChurchAnnouncementFormInput } from "@/lib/validation/church.schema";

type ChurchAnnouncement = {
  id: string;
  title: string;
  body_markdown: string;
  status: string;
};

const STATUS_LABELS: Record<string, string> = { draft: "草稿", published: "已發布" };

export function ChurchAnnouncementFormDialog({
  churchId,
  announcement,
  trigger,
}: {
  churchId: string;
  announcement?: ChurchAnnouncement;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ChurchAnnouncementFormInput>(
    announcement
      ? {
          id: announcement.id,
          churchId,
          title: announcement.title,
          bodyMarkdown: announcement.body_markdown,
          status: announcement.status as ChurchAnnouncementFormInput["status"],
        }
      : { churchId, title: "", bodyMarkdown: "", status: "draft" },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertChurchAnnouncement(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(announcement ? "已更新通知" : "已新增通知");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{announcement ? "編輯通知" : "新增通知"}</DialogTitle>
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
            <Label>內容（Markdown）</Label>
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
                setForm({ ...form, status: v as ChurchAnnouncementFormInput["status"] })
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
