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
import { respondToChurchRegistration } from "@/lib/actions/churches";

const STATUS_LABELS: Record<string, string> = {
  new: "新提交",
  contacted: "已聯絡",
  confirmed: "已確認",
  archived: "已封存",
};

export function ChurchRegistrationStatusSelect({
  registrationId,
  status,
}: {
  registrationId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await respondToChurchRegistration({
        registrationId,
        status: value as "new" | "contacted" | "confirmed" | "archived",
      });
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <Select items={STATUS_LABELS} value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-32" disabled={isPending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
