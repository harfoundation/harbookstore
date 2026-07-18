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
import { upsertSecondhandItem } from "@/lib/actions/secondhand";
import type { SecondhandItemFormInput } from "@/lib/validation/secondhand.schema";

type Item = {
  id: string;
  title: string;
  author: string | null;
  category_id: string | null;
  condition: string;
  description: string | null;
  price_cents: number;
  original_price_cents: number | null;
  branch_id: string | null;
  status: string;
};

const CONDITION_LABELS: Record<string, string> = {
  brand_new: "A 全新",
  near_new: "B 近全新",
  good: "C 良好",
  fair: "D 普通",
  poor: "E 差強人意",
};

const STATUS_LABELS: Record<string, string> = {
  available: "可購買",
  reserved: "已預訂",
  sold: "已售出",
};

export function SecondhandItemFormDialog({
  item,
  categories,
  branches,
  trigger,
}: {
  item?: Item;
  categories: { id: string; name_zh: string }[];
  branches: { id: string; suburb: string }[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<SecondhandItemFormInput>(
    item
      ? {
          id: item.id,
          title: item.title,
          author: item.author ?? "",
          categoryId: item.category_id,
          condition: item.condition as SecondhandItemFormInput["condition"],
          description: item.description ?? "",
          priceCents: item.price_cents,
          originalPriceCents: item.original_price_cents,
          branchId: item.branch_id,
          status: item.status as SecondhandItemFormInput["status"],
        }
      : {
          title: "",
          author: "",
          categoryId: null,
          condition: "good",
          description: "",
          priceCents: 0,
          originalPriceCents: null,
          branchId: null,
          status: "available",
        },
  );

  const suggestedMaxCents =
    form.originalPriceCents != null ? Math.round(form.originalPriceCents * 0.65) : null;

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertSecondhandItem(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "已更新商品" : "已新增商品");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "編輯二手商品" : "新增二手商品"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>書名／品名</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>作者（選填）</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>分類（選填）</Label>
            <Select
              items={{
                none: "（無）",
                ...Object.fromEntries(categories.map((c) => [c.id, c.name_zh])),
              }}
              value={form.categoryId ?? "none"}
              onValueChange={(v) =>
                setForm({ ...form, categoryId: v === "none" ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">（無）</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_zh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>狀況</Label>
              <Select
                items={CONDITION_LABELS}
                value={form.condition}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    condition: v as SecondhandItemFormInput["condition"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>售價（AUD 分）</Label>
              <Input
                type="number"
                min={0}
                value={form.priceCents}
                onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>原價（AUD 分，選填）</Label>
            <Input
              type="number"
              min={0}
              value={form.originalPriceCents ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  originalPriceCents: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            {suggestedMaxCents != null && (
              <p className="text-muted-foreground text-xs">
                參考二手書業界慣例（售價不超過原價 65%），建議售價不超過 AUD $
                {(suggestedMaxCents / 100).toFixed(2)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>說明（選填）</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>所在分店（選填）</Label>
            <Select
              items={{
                none: "（未指定）",
                ...Object.fromEntries(branches.map((b) => [b.id, b.suburb])),
              }}
              value={form.branchId ?? "none"}
              onValueChange={(v) =>
                setForm({ ...form, branchId: v === "none" ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">（未指定）</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.suburb}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>狀態</Label>
            <Select
              items={STATUS_LABELS}
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as SecondhandItemFormInput["status"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
