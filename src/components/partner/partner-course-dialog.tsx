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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitCourseForReview } from "@/lib/actions/courses";
import type { CourseFormInput } from "@/lib/validation/course.schema";

const CATEGORY_LABELS: Record<string, string> = {
  course: "課程",
  workshop: "工作坊",
  diploma: "文憑課程",
  retreat: "退修會",
  outreach: "外展事工",
  ministry_service: "教會服事",
};

const EMPTY: CourseFormInput = {
  title: "",
  description: "",
  instructorName: "",
  isPublished: false,
  sortOrder: 0,
  priceCents: null,
  termLabel: "",
  serviceCategory: "course",
  programLevel: null,
  accreditationNote: "",
};

export function PartnerCourseDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CourseFormInput>(EMPTY);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitCourseForReview(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("已提交課程，等候山書坊審核");
    setForm(EMPTY);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary">提交新課程</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>提交課程/服務供審核</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>名稱</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>講師/負責人</Label>
            <Input
              value={form.instructorName}
              onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>簡介</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>類型</Label>
            <Select
              items={CATEGORY_LABELS}
              value={form.serviceCategory}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  serviceCategory: v as CourseFormInput["serviceCategory"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>價格（澳幣分，留空為免費）</Label>
              <Input
                type="number"
                value={form.priceCents ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priceCents: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>期限</Label>
              <Input
                value={form.termLabel}
                onChange={(e) => setForm({ ...form, termLabel: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "提交中…" : "提交審核"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
