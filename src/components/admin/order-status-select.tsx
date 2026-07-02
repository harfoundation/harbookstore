"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminUpdateOrderStatus } from "@/lib/actions/orders";

const STATUSES = [
  { value: "pending_review", label: "待確認" },
  { value: "confirmed", label: "已確認付款" },
  { value: "fulfilled", label: "已出貨" },
  { value: "cancelled", label: "已取消" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={Object.fromEntries(STATUSES.map((s) => [s.value, s.label]))}
      value={status}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await adminUpdateOrderStatus({
            orderId,
            status: value as "pending_review" | "confirmed" | "fulfilled" | "cancelled",
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success(`訂單 ${result.orderNumber} 已更新`);
        });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
