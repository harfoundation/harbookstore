"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateGroupBuyProgress } from "@/lib/validation/order.schema";
import { createGroupBuyOrder } from "@/lib/actions/orders";

export function GroupBuyWidget({
  groupBuy,
  bookId,
  isLoggedIn,
}: {
  groupBuy: { id: string; current_qty: number; target_qty: number; status: string };
  bookId: string;
  isLoggedIn: boolean;
}) {
  // Raw string state — clamping on every keystroke forces the field back to
  // "1" the instant it's cleared, making it impossible to type a fresh
  // multi-digit number.
  const [quantityInput, setQuantityInput] = useState("1");
  const [isPending, startTransition] = useTransition();
  const progress = calculateGroupBuyProgress(groupBuy.current_qty, groupBuy.target_qty);
  const isOpen = groupBuy.status === "open";

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-sm font-medium">
        團購進度：{groupBuy.current_qty} / {groupBuy.target_qty}
      </p>
      <div className="bg-muted mb-3 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isOpen ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={20}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onBlur={() =>
              setQuantityInput(
                String(Math.max(1, Math.min(20, Math.trunc(Number(quantityInput)) || 1))),
              )
            }
            className="w-20"
          />
          <Button
            disabled={isPending}
            onClick={() => {
              if (!isLoggedIn) {
                toast.error("請先登入才能加入團購");
                return;
              }
              const quantity = Math.max(
                1,
                Math.min(20, Math.trunc(Number(quantityInput)) || 1),
              );
              setQuantityInput(String(quantity));
              startTransition(async () => {
                const result = await createGroupBuyOrder({
                  groupBuyId: groupBuy.id,
                  bookId,
                  quantity,
                  paymentMethod: "bank_transfer",
                });
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                toast.success(`已加入團購，訂單編號 ${result.orderNumber}`);
              });
            }}
          >
            加入團購
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">此團購已結束</p>
      )}
    </div>
  );
}
