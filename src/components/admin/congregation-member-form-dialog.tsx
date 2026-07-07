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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertCongregationMember } from "@/lib/actions/attendance";
import type { CongregationMemberFormInput } from "@/lib/validation/attendance.schema";

type Member = {
  id: string;
  display_name: string;
  member_type: string;
  notes: string | null;
  is_active: boolean;
};

const TYPE_LABELS: Record<string, string> = { regular: "老朋友", co_worker: "同工" };

export function CongregationMemberFormDialog({
  congregationId,
  member,
  trigger,
}: {
  congregationId: string;
  member?: Member;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CongregationMemberFormInput>(
    member
      ? {
          id: member.id,
          congregationId,
          displayName: member.display_name,
          memberType: member.member_type as CongregationMemberFormInput["memberType"],
          notes: member.notes ?? "",
          isActive: member.is_active,
        }
      : {
          congregationId,
          displayName: "",
          memberType: "regular",
          notes: "",
          isActive: true,
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertCongregationMember(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(member ? "已更新成員" : "已新增成員");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "編輯成員" : "新增成員"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>姓名</Label>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>類型</Label>
            <Select
              items={TYPE_LABELS}
              value={form.memberType}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  memberType: v as CongregationMemberFormInput["memberType"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">老朋友</SelectItem>
                <SelectItem value="co_worker">同工</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>備註（選填）</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            仍在名單中
          </label>
        </div>

        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "儲存中…" : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
