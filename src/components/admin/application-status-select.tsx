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
import { updateTeamApplicationStatus } from "@/lib/actions/team-applications";

const STATUSES = [
  { value: "submitted", label: "已提交" },
  { value: "reviewing", label: "審核中" },
  { value: "accepted", label: "已接受" },
  { value: "declined", label: "已婉拒" },
];

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
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
          const result = await updateTeamApplicationStatus(
            applicationId,
            value as "submitted" | "reviewing" | "accepted" | "declined",
          );
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已更新申請狀態");
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
