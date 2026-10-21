"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewPlantingApplication } from "@/lib/actions/planting-applications";
import { APPLICATION_STATUS_LABEL } from "@/lib/planting/program";
import type { PlantingReviewInput } from "@/lib/validation/planting.schema";

type Status = PlantingReviewInput["status"];

export function PlantingReviewForm({
  applicationId,
  status: initialStatus,
  interviewNotes,
}: {
  applicationId: string;
  status: Status;
  interviewNotes: string | null;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [notes, setNotes] = useState(interviewNotes ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(APPLICATION_STATUS_LABEL) as Status[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {APPLICATION_STATUS_LABEL[s]}
          </Button>
        ))}
      </div>
      <Textarea
        className="min-h-20 text-sm"
        placeholder="面談記錄（只有同工看得到）"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button
        size="sm"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const result = await reviewPlantingApplication({
            applicationId,
            status,
            interviewNotes: notes,
          });
          setSaving(false);
          if (!result.success) toast.error(result.error);
          else toast.success("已儲存");
        }}
      >
        {saving ? "儲存中…" : "儲存"}
      </Button>
    </div>
  );
}
