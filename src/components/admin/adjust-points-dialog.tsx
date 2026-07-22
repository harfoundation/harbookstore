"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminAdjustPoints } from "@/lib/actions/points";

export function AdjustPointsDialog({
  profileId,
  displayName,
}: {
  profileId: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        調整點數
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>調整 {displayName} 的點數</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>點數（正數為加分，負數為扣分）</Label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="例如 10 或 -5"
            />
          </div>
          <div className="space-y-1.5">
            <Label>備註（選填）</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：協助活動籌備"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={submitting}
            onClick={async () => {
              const n = Number(points);
              if (!Number.isInteger(n) || n === 0) {
                toast.error("請輸入非零整數");
                return;
              }
              setSubmitting(true);
              const result = await adminAdjustPoints(profileId, n, note);
              setSubmitting(false);
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              toast.success("已調整點數");
              setOpen(false);
              setPoints("");
              setNote("");
            }}
          >
            {submitting ? "送出中…" : "送出"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
