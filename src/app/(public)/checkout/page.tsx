"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRetailOrder } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/client";

type Branch = { id: string; suburb: string; city: string; state: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, itemPricing, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "in_person">(
    "bank_transfer",
  );
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("branches")
      .select("id, suburb, city, state")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setBranches(data ?? []);
        const defaultBranch = data?.[0];
        if (defaultBranch) setBranchId(defaultBranch.id);
      });
  }, []);

  if (items.length === 0) {
    return (
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">結帳</h1>
        <p className="text-muted-foreground">購物車是空的，請先選購書籍。</p>
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createRetailOrder({
      items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
      paymentMethod,
      branchId: paymentMethod === "in_person" ? branchId || undefined : undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    clear();
    toast.success(`訂單已建立：${result.orderNumber}`);
    router.push(`/orders?created=${result.orderNumber}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">結帳</h1>

      <div className="space-y-2 rounded-lg border p-4">
        {items.map((item) => {
          const pricing = itemPricing.get(item.bookId);
          return (
            <div key={item.bookId} className="flex items-center justify-between text-sm">
              <span>
                {item.title} × {item.quantity}
                {pricing?.discountLabel && (
                  <span className="ml-1.5 text-xs text-green-700">
                    （{pricing.discountLabel}）
                  </span>
                )}
              </span>
              <span>AUD ${(((pricing?.unitPriceCents ?? 0) * item.quantity) / 100).toFixed(2)}</span>
            </div>
          );
        })}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>總計</span>
          <span>AUD ${(subtotalCents / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>付款方式</Label>
        <Select
          items={{ bank_transfer: "銀行轉帳", in_person: "親臨繳付" }}
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">銀行轉帳</SelectItem>
            <SelectItem value="in_person">親臨繳付</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === "in_person" && branches.length > 0 && (
        <div className="space-y-1.5">
          <Label>取件分店</Label>
          <Select
            items={Object.fromEntries(
              branches.map((b) => [b.id, `${b.suburb}（${b.city}, ${b.state}）`]),
            )}
            value={branchId}
            onValueChange={(v) => setBranchId(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.suburb}（{b.city}, {b.state}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">備註（選填）</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <p className="text-muted-foreground text-sm">
        此為公益訂購，我們不會直接收取線上付款。送出訂單後，我們會透過電郵提供銀行轉帳詳情，
        待您完成付款後，工作人員將手動確認並安排出貨。
      </p>

      <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "送出中…" : "送出訂單"}
      </Button>
    </div>
  );
}
