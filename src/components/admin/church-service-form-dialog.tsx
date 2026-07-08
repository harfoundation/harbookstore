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
import { upsertChurchService } from "@/lib/actions/churches";
import type { ChurchServiceFormInput } from "@/lib/validation/church.schema";

type ChurchService = {
  id: string;
  name_zh: string;
  schedule_label: string;
  day_of_week: number | null;
  language: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

const DAY_LABELS: Record<string, string> = {
  none: "（不限定星期／每日）",
  "0": "星期日",
  "1": "星期一",
  "2": "星期二",
  "3": "星期三",
  "4": "星期四",
  "5": "星期五",
  "6": "星期六",
};

export function ChurchServiceFormDialog({
  churchId,
  service,
  trigger,
}: {
  churchId: string;
  service?: ChurchService;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ChurchServiceFormInput>(
    service
      ? {
          id: service.id,
          churchId,
          nameZh: service.name_zh,
          scheduleLabel: service.schedule_label,
          dayOfWeek: service.day_of_week,
          language: service.language ?? "",
          description: service.description ?? "",
          sortOrder: service.sort_order,
          isActive: service.is_active,
        }
      : {
          churchId,
          nameZh: "",
          scheduleLabel: "",
          dayOfWeek: null,
          language: "",
          description: "",
          sortOrder: 0,
          isActive: true,
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertChurchService(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(service ? "已更新聚會" : "已新增聚會");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "編輯聚會" : "新增聚會"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>聚會名稱</Label>
            <Input
              placeholder="例如：主日崇拜（上午）"
              value={form.nameZh}
              onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>時間說明</Label>
            <Input
              placeholder="例如：每主日上午 10:00，或 每兩週星期二晚上"
              value={form.scheduleLabel}
              onChange={(e) => setForm({ ...form, scheduleLabel: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>星期（用於排序，選填）</Label>
              <Select
                items={DAY_LABELS}
                value={form.dayOfWeek === null ? "none" : String(form.dayOfWeek)}
                onValueChange={(v) =>
                  setForm({ ...form, dayOfWeek: v === "none" ? null : Number(v) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DAY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>語言（選填）</Label>
              <Input
                placeholder="粵語 / 普通話 / 雙語"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>說明（選填）</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            啟用中（顯示於公開頁面）
          </label>
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
