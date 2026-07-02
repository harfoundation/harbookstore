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
import { adminUpdateBorrowRequestStatus } from "@/lib/actions/borrow-requests";

const STATUSES = [
  { value: "requested", label: "已申請" },
  { value: "approved", label: "已批准" },
  { value: "picked_up", label: "已取書" },
  { value: "returned", label: "已歸還" },
  { value: "cancelled", label: "已取消" },
];

export function BorrowRequestStatusSelect({
  borrowRequestId,
  status,
}: {
  borrowRequestId: string;
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
          const result = await adminUpdateBorrowRequestStatus({
            borrowRequestId,
            status: value as
              "requested" | "approved" | "picked_up" | "returned" | "cancelled",
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已更新借閱狀態");
        });
      }}
    >
      <SelectTrigger className="w-32">
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
