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
import { upsertBook } from "@/lib/actions/books";
import type { BookFormInput } from "@/lib/validation/book.schema";

type Book = {
  id: string;
  category_id: string | null;
  poster_number: number | null;
  title: string;
  author: string | null;
  translator: string | null;
  isbn: string | null;
  description: string | null;
  price_cents: number | null;
  group_buy_price_cents: number | null;
  group_buy_min_qty: number | null;
  procurement_status: string;
  stock_qty: number;
  is_lendable: boolean;
  is_active: boolean;
};

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
  isActive: true,
};

export function BookFormDialog({
  book,
  categories,
  trigger,
}: {
  book?: Book;
  categories: { id: string; name_zh: string }[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BookFormInput>(
    book
      ? {
          id: book.id,
          categoryId: book.category_id,
          posterNumber: book.poster_number,
          title: book.title,
          author: book.author ?? "",
          translator: book.translator ?? "",
          isbn: book.isbn ?? "",
          description: book.description ?? "",
          priceCents: book.price_cents,
          groupBuyPriceCents: book.group_buy_price_cents,
          groupBuyMinQty: book.group_buy_min_qty,
          procurementStatus:
            book.procurement_status as BookFormInput["procurementStatus"],
          stockQty: book.stock_qty,
          isLendable: book.is_lendable,
          isActive: book.is_active,
        }
      : EMPTY,
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertBook(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(book ? "已更新書籍" : "已新增書籍");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{book ? "編輯書籍" : "新增書籍"}</DialogTitle>
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
              <Label>譯者</Label>
              <Input
                value={form.translator}
                onChange={(e) => setForm({ ...form, translator: e.target.value })}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>海報編號</Label>
              <Input
                type="number"
                value={form.posterNumber ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    posterNumber: e.target.value ? Number(e.target.value) : null,
                  })
                }
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
            <Label>簡介</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>價格（澳幣分，如 $25.00 = 2500）</Label>
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
            <div className="space-y-1.5">
              <Label>庫存</Label>
              <Input
                type="number"
                value={form.stockQty}
                onChange={(e) =>
                  setForm({ ...form, stockQty: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>團購價（澳幣分）</Label>
              <Input
                type="number"
                value={form.groupBuyPriceCents ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    groupBuyPriceCents: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>團購最低件數</Label>
              <Input
                type="number"
                value={form.groupBuyMinQty ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    groupBuyMinQty: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>進貨狀態</Label>
            <Select
              items={{
                available: "現貨",
                preorder: "預購中",
                out_of_stock: "缺貨",
                discontinued: "已下架",
              }}
              value={form.procurementStatus}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  procurementStatus: v as BookFormInput["procurementStatus"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">現貨</SelectItem>
                <SelectItem value="preorder">預購中</SelectItem>
                <SelectItem value="out_of_stock">缺貨</SelectItem>
                <SelectItem value="discontinued">已下架</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isLendable}
                onChange={(e) => setForm({ ...form, isLendable: e.target.checked })}
              />
              可借閱
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              上架中
            </label>
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
