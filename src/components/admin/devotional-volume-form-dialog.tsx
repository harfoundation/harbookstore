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
import { upsertDevotionalVolume } from "@/lib/actions/devotionals";
import type { DevotionalVolumeFormInput } from "@/lib/validation/devotional.schema";

type Volume = {
  id: string;
  volume_number: number;
  title_zh: string;
  subtitle_zh: string | null;
  intro_markdown: string | null;
};

export function DevotionalVolumeFormDialog({
  bookId,
  volume,
  nextVolumeNumber,
  trigger,
}: {
  bookId: string;
  volume?: Volume;
  nextVolumeNumber?: number;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DevotionalVolumeFormInput>(
    volume
      ? {
          id: volume.id,
          bookId,
          volumeNumber: volume.volume_number,
          titleZh: volume.title_zh,
          subtitleZh: volume.subtitle_zh ?? "",
          introMarkdown: volume.intro_markdown ?? "",
        }
      : {
          bookId,
          volumeNumber: nextVolumeNumber ?? 1,
          titleZh: "",
          subtitleZh: "",
          introMarkdown: "",
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertDevotionalVolume(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(volume ? "已更新卷次" : "已新增卷次");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{volume ? "編輯卷次" : "新增卷次"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>卷次編號</Label>
            <Input
              type="number"
              value={form.volumeNumber}
              onChange={(e) => setForm({ ...form, volumeNumber: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>卷名</Label>
            <Input
              value={form.titleZh}
              onChange={(e) => setForm({ ...form, titleZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>副標</Label>
            <Input
              value={form.subtitleZh}
              onChange={(e) => setForm({ ...form, subtitleZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>卷首語（Markdown）</Label>
            <Textarea
              className="min-h-24 font-mono text-sm"
              value={form.introMarkdown}
              onChange={(e) => setForm({ ...form, introMarkdown: e.target.value })}
            />
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
