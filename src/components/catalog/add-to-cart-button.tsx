"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({
  book,
}: {
  book: {
    id: string;
    title: string;
    author: string | null;
    cover_image_url: string | null;
    price_cents: number | null;
    group_buy_price_cents?: number | null;
    group_buy_min_qty?: number | null;
    procurement_status: string;
  };
}) {
  const { addItem } = useCart();
  // Kept as a raw string so the user can freely type/clear multi-digit
  // quantities — clamping on every keystroke (e.g. via Number(x) || 1)
  // forces the field back to "1" the instant it's cleared, making it
  // impossible to type a fresh number like "24".
  const [quantityInput, setQuantityInput] = useState("1");
  const disabled =
    book.procurement_status === "out_of_stock" ||
    book.procurement_status === "discontinued";

  function normalizeQuantity() {
    const n = Math.max(1, Math.min(200, Math.trunc(Number(quantityInput)) || 1));
    setQuantityInput(String(n));
    return n;
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        max={200}
        value={quantityInput}
        onChange={(e) => setQuantityInput(e.target.value)}
        onBlur={normalizeQuantity}
        className="w-20"
        disabled={disabled}
      />
      <Button
        disabled={disabled}
        onClick={() => {
          const quantity = normalizeQuantity();
          addItem(
            {
              bookId: book.id,
              title: book.title,
              author: book.author,
              coverImageUrl: book.cover_image_url,
              priceCents: book.price_cents,
              groupBuyPriceCents: book.group_buy_price_cents ?? null,
              groupBuyMinQty: book.group_buy_min_qty ?? null,
            },
            quantity,
          );
          toast.success(`已加入購物車：${book.title}`);
        }}
      >
        加入購物車
      </Button>
    </div>
  );
}
