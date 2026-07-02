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
import { upsertLesson } from "@/lib/actions/courses";
import type { LessonFormInput } from "@/lib/validation/course.schema";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
};

export function LessonFormDialog({
  courseId,
  lesson,
  trigger,
}: {
  courseId: string;
  lesson?: Lesson;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<LessonFormInput>(
    lesson
      ? {
          id: lesson.id,
          courseId: lesson.course_id,
          title: lesson.title,
          videoUrl: lesson.video_url ?? "",
          durationSeconds: lesson.duration_seconds ?? undefined,
          sortOrder: lesson.sort_order,
          isPublished: lesson.is_published,
        }
      : {
          courseId,
          title: "",
          videoUrl: "",
          durationSeconds: undefined,
          sortOrder: 0,
          isPublished: false,
        },
  );

  async function handleSubmit() {
    setSubmitting(true);
    const result = await upsertLesson(form);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(lesson ? "已更新課堂" : "已新增課堂");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lesson ? "編輯課堂" : "新增課堂"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>課堂名稱</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>影片連結（YouTube/Vimeo 嵌入網址）</Label>
            <Input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>片長（秒）</Label>
              <Input
                type="number"
                value={form.durationSeconds ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationSeconds: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
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
