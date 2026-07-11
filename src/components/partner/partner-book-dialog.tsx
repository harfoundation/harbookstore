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
import { submitBookForReview } from "@/lib/actions/books";
import type { BookFormInput } from "@/lib/validation/book.schema";

const EMPTY: BookFormInput = {
  categoryId: null,
  posterNumber: null,
  title: "",
  author: "",
  translator: "",
  isbn: "",
  description: "",
  priceCents: null,
  groupBuyPriceCents: null,
  groupBuyMinQty: null,
  procurementStatus: "preorder",
  stockQty: 0,
  isLendable: false,
  isActive: false,
};

export function PartnerBookDialog({
  categories,
}: {
  categories: { id: string; name_zh: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BookFormInput>(EMPTY);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitBookForReview(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("已提交書籍，等候山書坊審核");
    setForm(EMPTY);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>提交新書籍</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>提交書籍供審核</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>書名</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>作者</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ISBN</Label>
              <Input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>分類</Label>
            <Select
              items={{
                none: "（未分類）",
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
                <SelectItem value="none">（未分類）</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_zh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>簡介</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>建議售價（澳幣分）</Label>
            <Input
              type="number"
              value={form.priceCents ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  priceCents: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "提交中…" : "提交審核"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
