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
import { upsertBranch } from "@/lib/actions/branches";
import type { BranchFormInput } from "@/lib/validation/branch.schema";

type Branch = {
  id: string;
  state: string;
  city: string;
  suburb: string;
  address: string | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: BranchFormInput = {
  state: "VIC",
  city: "",
  suburb: "",
  address: "",
  isDefault: false,
  isActive: true,
  sortOrder: 0,
};

export function BranchFormDialog({
  branch,
  trigger,
}: {
  branch?: Branch;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BranchFormInput>(
    branch
      ? {
          id: branch.id,
          state: branch.state,
          city: branch.city,
          suburb: branch.suburb,
          address: branch.address ?? "",
          isDefault: branch.is_default,
          isActive: branch.is_active,
          sortOrder: branch.sort_order,
        }
      : EMPTY,
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertBranch(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(branch ? "已更新分店" : "已新增分店");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{branch ? "編輯分店" : "新增分店"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>州別</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>城市</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>分店所在區域（如 Box Hill）</Label>
            <Input
              value={form.suburb}
              onChange={(e) => setForm({ ...form, suburb: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>地址（選填）</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              預設分店
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              啟用中
            </label>
          </div>
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
