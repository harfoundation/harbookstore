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
import { upsertWorshipSong } from "@/lib/actions/churches";
import type { WorshipSongFormInput } from "@/lib/validation/church.schema";

type WorshipSong = {
  id: string;
  title: string;
  lyrics_markdown: string | null;
  file_url: string | null;
};

export function WorshipSongFormDialog({
  churchId,
  song,
  trigger,
}: {
  churchId: string;
  song?: WorshipSong;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WorshipSongFormInput>(
    song
      ? {
          id: song.id,
          churchId,
          title: song.title,
          lyricsMarkdown: song.lyrics_markdown ?? "",
          fileUrl: song.file_url ?? "",
        }
      : { churchId, title: "", lyricsMarkdown: "", fileUrl: "" },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertWorshipSong(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(song ? "已更新詩歌" : "已新增詩歌");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{song ? "編輯詩歌" : "新增詩歌"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>詩歌名稱</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>歌詞（選填）</Label>
            <Textarea
              className="min-h-32"
              value={form.lyricsMarkdown}
              onChange={(e) => setForm({ ...form, lyricsMarkdown: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>投影片／樂譜檔案網址（選填）</Label>
            <Input
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
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
