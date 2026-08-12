"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ensureUpcomingDutyShifts } from "@/lib/actions/duty-shifts";

export function DutyRosterGenerateForm({
  branches,
}: {
  branches: { id: string; suburb: string }[];
}) {
  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? "none");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">分店</p>
        <Select
          items={{
            none: "（未指定）",
            ...Object.fromEntries(branches.map((b) => [b.id, b.suburb])),
          }}
          value={branchId}
          onValueChange={(v) => setBranchId(v ?? "none")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">（未指定）</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.suburb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          const result = await ensureUpcomingDutyShifts(
            8,
            branchId === "none" ? null : branchId,
          );
          setSubmitting(false);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("已產生未來 8 週的週二至週四每小時班次（10am–5pm）");
        }}
      >
        {submitting ? "產生中…" : "產生未來 8 週班次"}
      </Button>
    </div>
  );
}
