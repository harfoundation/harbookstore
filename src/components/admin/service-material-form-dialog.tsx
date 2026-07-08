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
import { upsertServiceMaterial } from "@/lib/actions/churches";
import type { ServiceMaterialFormInput } from "@/lib/validation/church.schema";

type ServiceMaterial = {
  id: string;
  service_id: string;
  service_date: string;
  sermon_title: string | null;
  sermon_speaker: string | null;
  sermon_ppt_url: string | null;
  notes: string | null;
  status: string;
  songIds: string[];
};

const STATUS_LABELS: Record<string, string> = { draft: "草稿", published: "已發布" };

export function ServiceMaterialFormDialog({
  churchId,
  services,
  songs,
  material,
  defaultServiceId,
  trigger,
}: {
  churchId: string;
  services: { id: string; name_zh: string }[];
  songs: { id: string; title: string }[];
  material?: ServiceMaterial;
  defaultServiceId?: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ServiceMaterialFormInput>(
    material
      ? {
          id: material.id,
          churchId,
          serviceId: material.service_id,
          serviceDate: material.service_date,
          sermonTitle: material.sermon_title ?? "",
          sermonSpeaker: material.sermon_speaker ?? "",
          sermonPptUrl: material.sermon_ppt_url ?? "",
          notes: material.notes ?? "",
          status: material.status as ServiceMaterialFormInput["status"],
          songIds: material.songIds,
        }
      : {
          churchId,
          serviceId: defaultServiceId ?? services[0]?.id ?? "",
          serviceDate: new Date().toISOString().slice(0, 10),
          sermonTitle: "",
          sermonSpeaker: "",
          sermonPptUrl: "",
          notes: "",
          status: "draft",
          songIds: [],
        },
  );

  function toggleSong(songId: string) {
    setForm((prev) => ({
      ...prev,
      songIds: prev.songIds.includes(songId)
        ? prev.songIds.filter((id) => id !== songId)
        : [...prev.songIds, songId],
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertServiceMaterial(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(material ? "已更新聚會資料" : "已新增聚會資料");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{material ? "編輯聚會資料" : "新增聚會資料"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>聚會</Label>
              <Select
                items={Object.fromEntries(services.map((s) => [s.id, s.name_zh]))}
                value={form.serviceId}
                onValueChange={(v) => v && setForm({ ...form, serviceId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name_zh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>日期</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>講道主題（選填）</Label>
              <Input
                value={form.sermonTitle}
                onChange={(e) => setForm({ ...form, sermonTitle: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>講員（選填）</Label>
              <Input
                value={form.sermonSpeaker}
                onChange={(e) => setForm({ ...form, sermonSpeaker: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>講道 PPT 網址（選填）</Label>
            <Input
              value={form.sermonPptUrl}
              onChange={(e) => setForm({ ...form, sermonPptUrl: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>敬拜詩歌（可複選）</Label>
            {songs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                尚未建立任何詩歌，請先到「敬拜詩歌」新增。
              </p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                {songs.map((song) => (
                  <label key={song.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.songIds.includes(song.id)}
                      onChange={() => toggleSong(song.id)}
                    />
                    {song.title}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>備註（選填）</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>狀態</Label>
            <Select
              items={STATUS_LABELS}
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as ServiceMaterialFormInput["status"] })
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
