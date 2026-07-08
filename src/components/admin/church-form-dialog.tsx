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
import { upsertChurch } from "@/lib/actions/churches";
import type { ChurchFormInput } from "@/lib/validation/church.schema";

type Church = {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  billing_status: string;
  billing_plan_cents: number | null;
  billing_notes: string | null;
};

const BILLING_STATUS_LABELS: Record<string, string> = {
  internal: "本堂（免費）",
  trial: "試用中",
  pending_invoice: "待請款",
  paid: "已付款",
  overdue: "逾期未付",
  cancelled: "已終止",
};

const EMPTY: ChurchFormInput = {
  slug: "",
  nameZh: "",
  nameEn: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  isActive: true,
  billingStatus: "trial",
  billingPlanCents: null,
  billingNotes: "",
};

export function ChurchFormDialog({
  church,
  trigger,
}: {
  church?: Church;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ChurchFormInput>(
    church
      ? {
          id: church.id,
          slug: church.slug,
          nameZh: church.name_zh,
          nameEn: church.name_en ?? "",
          contactName: church.contact_name ?? "",
          contactEmail: church.contact_email ?? "",
          contactPhone: church.contact_phone ?? "",
          isActive: church.is_active,
          billingStatus: church.billing_status as ChurchFormInput["billingStatus"],
          billingPlanCents: church.billing_plan_cents,
          billingNotes: church.billing_notes ?? "",
        }
      : EMPTY,
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertChurch(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(church ? "已更新堂會" : "已新增堂會");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{church ? "編輯堂會" : "新增堂會"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>堂會名稱</Label>
            <Input
              value={form.nameZh}
              onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>英文名稱（選填）</Label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>網址代稱（slug，僅限小寫英數與連字號）</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>聯絡人（選填）</Label>
              <Input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>聯絡電話（選填）</Label>
              <Input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>聯絡電郵（選填）</Label>
            <Input
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>收費狀態</Label>
              <Select
                items={BILLING_STATUS_LABELS}
                value={form.billingStatus}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    billingStatus: v as ChurchFormInput["billingStatus"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BILLING_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>月費（澳幣分，留空為免費）</Label>
              <Input
                type="number"
                value={form.billingPlanCents ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    billingPlanCents: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>收費備註（選填，僅內部可見）</Label>
            <Textarea
              value={form.billingNotes}
              onChange={(e) => setForm({ ...form, billingNotes: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            啟用中（公開頁面可見）
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
