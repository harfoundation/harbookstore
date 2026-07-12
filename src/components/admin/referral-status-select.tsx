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
import { updateReferralStatus } from "@/lib/actions/member-referrals";

const STATUS_LABEL: Record<string, string> = {
  pending: "待跟進",
  joined: "已加入",
  declined: "未加入",
};

export function ReferralStatusSelect({
  referralId,
  status,
}: {
  referralId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={STATUS_LABEL}
      value={status}
      onValueChange={(v) => {
        if (!v) return;
        startTransition(async () => {
          const result = await updateReferralStatus(
            referralId,
            v as "pending" | "joined" | "declined",
          );
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已更新狀態");
        });
      }}
    >
      <SelectTrigger disabled={isPending} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
