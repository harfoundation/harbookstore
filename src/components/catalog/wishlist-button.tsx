"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function WishlistButton({
  bookId,
  initialInWishlist,
  isLoggedIn,
}: {
  bookId: string;
  initialInWishlist: boolean;
  isLoggedIn: boolean;
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!isLoggedIn) {
          toast.error("請先登入才能使用心願單");
          return;
        }
        startTransition(async () => {
          const result = await toggleWishlist(bookId);
          if ("error" in result) {
            toast.error(result.error);
            return;
          }
          setInWishlist(result.inWishlist);
          toast.success(result.inWishlist ? "已加入心願單" : "已從心願單移除");
        });
      }}
    >
      {inWishlist ? "★ 已在心願單" : "☆ 加入心願單"}
    </Button>
  );
}
