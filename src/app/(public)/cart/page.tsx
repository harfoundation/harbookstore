"use client";

import Link from "next/link";
import { useCart, effectiveUnitPriceCents } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">購物車</h1>
        <p className="text-muted-foreground">您的購物車是空的。</p>
        <Button render={<Link href="/catalog" />}>前往書目</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">購物車</h1>

      <div className="divide-y rounded-lg border">
        {items.map((item) => {
          const unitPriceCents = effectiveUnitPriceCents(item);
          const isGroupBuyPrice =
            item.groupBuyPriceCents != null && unitPriceCents === item.groupBuyPriceCents;
          return (
            <div key={item.bookId} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                {item.author && (
                  <p className="text-muted-foreground text-sm">{item.author}</p>
                )}
                {isGroupBuyPrice ? (
                  <p className="text-sm text-green-700">
                    已達團購最低件數，套用團購價 AUD ${(item.groupBuyPriceCents! / 100).toFixed(2)}
                  </p>
                ) : (
                  item.groupBuyMinQty != null &&
                  item.groupBuyPriceCents != null && (
                    <p className="text-muted-foreground text-sm">
                      滿 {item.groupBuyMinQty} 件可享團購價 AUD $
                      {(item.groupBuyPriceCents / 100).toFixed(2)}
                    </p>
                  )
                )}
              </div>
              <Input
                type="number"
                min={1}
                max={200}
                value={item.quantity}
                onChange={(e) =>
                  setQuantity(item.bookId, Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20"
              />
              <span className="w-24 text-right text-sm">
                AUD ${((unitPriceCents * item.quantity) / 100).toFixed(2)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.bookId)}>
                移除
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">
          總計：AUD ${(subtotalCents / 100).toFixed(2)}
        </span>
        <Button render={<Link href="/checkout" />} size="lg">
          前往結帳
        </Button>
      </div>
    </div>
  );
}
