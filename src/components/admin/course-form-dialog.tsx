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
import { upsertCourse } from "@/lib/actions/courses";
import type { CourseFormInput } from "@/lib/validation/course.schema";

type Course = {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
  is_published: boolean;
  sort_order: number;
  price_cents: number | null;
  term_label: string | null;
  service_category: string;
  program_level: string | null;
  accreditation_note: string | null;
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

const CATEGORY_LABELS: Record<string, string> = {
  course: "課程",
  workshop: "工作坊",
  diploma: "文憑課程",
  retreat: "退修會",
  outreach: "外展事工",
  ministry_service: "教會服事",
};

const PROGRAM_LEVEL_LABELS: Record<string, string> = {
  none: "（無）",
  certificate_i: "Certificate I",
  certificate_ii: "Certificate II",
  certificate_iii: "Certificate III",
  certificate_iv: "Certificate IV",
  diploma_1: "Diploma — 第1級",
  diploma_2: "Diploma — 第2級",
  diploma_3: "Diploma — 第3級",
  diploma_4: "Diploma — 第4級",
};

export function CourseFormDialog({
  course,
  trigger,
}: {
  course?: Course;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CourseFormInput>(
    course
      ? {
          id: course.id,
          title: course.title,
          description: course.description ?? "",
          instructorName: course.instructor_name ?? "",
          isPublished: course.is_published,
          sortOrder: course.sort_order,
          priceCents: course.price_cents,
          termLabel: course.term_label ?? "",
          serviceCategory: course.service_category as CourseFormInput["serviceCategory"],
          programLevel: course.program_level as CourseFormInput["programLevel"],
          accreditationNote: course.accreditation_note ?? "",
        }
      : EMPTY,
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertCourse(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(course ? "已更新課程" : "已新增課程");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? "編輯課程" : "新增課程"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>課程名稱</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>講師</Label>
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
            <Label>服務類型</Label>
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
              <Label>期限（如：8週、一學期）</Label>
              <Input
                value={form.termLabel}
                onChange={(e) => setForm({ ...form, termLabel: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>課程級別（僅供排程參考，非正式認證）</Label>
            <Select
              items={PROGRAM_LEVEL_LABELS}
              value={form.programLevel ?? "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  programLevel:
                    v === "none" ? null : (v as CourseFormInput["programLevel"]),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROGRAM_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.programLevel && (
            <div className="space-y-1.5">
              <Label>認證說明（例如：本課程非正式認證資歷，或標註合作RTO名稱）</Label>
              <Textarea
                value={form.accreditationNote}
                onChange={(e) => setForm({ ...form, accreditationNote: e.target.value })}
                placeholder="本課程僅供內部進度追蹤，並非受認證的TAFE同等學歷……"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>排序</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            已發布
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
