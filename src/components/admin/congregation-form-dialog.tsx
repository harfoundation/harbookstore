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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertCongregation } from "@/lib/actions/attendance";
import type { CongregationFormInput } from "@/lib/validation/attendance.schema";

type Congregation = {
  id: string;
  name: string;
  service_period: string;
  sort_order: number;
  is_active: boolean;
};

const PERIOD_LABELS: Record<string, string> = {
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
};

export function CongregationFormDialog({
  congregation,
  trigger,
}: {
  congregation?: Congregation;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CongregationFormInput>(
    congregation
      ? {
          id: congregation.id,
          name: congregation.name,
          servicePeriod:
            congregation.service_period as CongregationFormInput["servicePeriod"],
          sortOrder: congregation.sort_order,
          isActive: congregation.is_active,
        }
      : { name: "", servicePeriod: "morning", sortOrder: 0, isActive: true },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertCongregation(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(congregation ? "已更新堂會" : "已新增堂會");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{congregation ? "編輯堂會" : "新增堂會"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>名稱</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>崇拜時段</Label>
            <Select
              items={PERIOD_LABELS}
              value={form.servicePeriod}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  servicePeriod: v as CongregationFormInput["servicePeriod"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
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
            啟用中
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
