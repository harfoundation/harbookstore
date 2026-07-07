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
import { upsertBookableService } from "@/lib/actions/bookings";
import type { BookableServiceFormInput } from "@/lib/validation/booking.schema";

type Service = {
  id: string;
  branch_id: string | null;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  cafe_coop: "Co-op / Cafe",
  consultation: "諮詢／面談",
  venue_hire: "場地租借",
  other: "其他",
};

export function BookableServiceFormDialog({
  service,
  branches,
  trigger,
}: {
  service?: Service;
  branches: { id: string; suburb: string }[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BookableServiceFormInput>(
    service
      ? {
          id: service.id,
          branchId: service.branch_id ?? undefined,
          name: service.name,
          description: service.description ?? "",
          category: service.category as BookableServiceFormInput["category"],
          isActive: service.is_active,
          sortOrder: service.sort_order,
        }
      : {
          name: "",
          description: "",
          category: "other",
          isActive: true,
          sortOrder: 0,
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertBookableService(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(service ? "已更新服務" : "已新增服務");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "編輯可預約服務" : "新增可預約服務"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>服務名稱</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>說明（選填）</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>分類</Label>
            <Select
              items={CATEGORY_LABELS}
              value={form.category}
              onValueChange={(v) =>
                setForm({ ...form, category: v as BookableServiceFormInput["category"] })
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
          <div className="space-y-1.5">
            <Label>所屬分店（選填）</Label>
            <Select
              items={{
                none: "（不限分店）",
                ...Object.fromEntries(branches.map((b) => [b.id, b.suburb])),
              }}
              value={form.branchId ?? "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  branchId: v === "none" ? undefined : (v ?? undefined),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">（不限分店）</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.suburb}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            開放預約
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
