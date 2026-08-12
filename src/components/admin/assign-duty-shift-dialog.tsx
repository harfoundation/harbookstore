"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminAssignDutyShift } from "@/lib/actions/duty-shifts";
import { createClient } from "@/lib/supabase/client";

type ProfileOption = { id: string; display_name: string | null };

export function AssignDutyShiftDialog({ shiftId }: { shiftId: string }) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || profiles.length > 0) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, display_name")
      .order("display_name")
      .then(({ data }) => setProfiles(data ?? []));
  }, [open, profiles.length]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>指派</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>指派此班次</DialogTitle>
        </DialogHeader>
        <Select
          items={Object.fromEntries(
            profiles.map((p) => [p.id, p.display_name ?? p.id]),
          )}
          value={profileId}
          onValueChange={(v) => setProfileId(v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇同工／志工" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.display_name ?? p.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            disabled={submitting || !profileId}
            onClick={async () => {
              setSubmitting(true);
              const result = await adminAssignDutyShift(shiftId, profileId);
              setSubmitting(false);
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              toast.success("已指派");
              setOpen(false);
            }}
          >
            {submitting ? "送出中…" : "確認指派"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
