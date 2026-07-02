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
    procurement_status: string;
  };
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const disabled =
    book.procurement_status === "out_of_stock" ||
    book.procurement_status === "discontinued";

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        max={20}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="w-20"
        disabled={disabled}
      />
      <Button
        disabled={disabled}
        onClick={() => {
          addItem(
            {
              bookId: book.id,
              title: book.title,
              author: book.author,
              coverImageUrl: book.cover_image_url,
              priceCents: book.price_cents,
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
