import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LessonFormDialog } from "@/components/admin/lesson-form-dialog";

export const dynamic = "force-dynamic";

export default async function AdminCourseLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id, title, video_url, duration_seconds, sort_order, is_published")
    .eq("course_id", courseId)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{course.title} — 課堂管理</h1>
        <LessonFormDialog courseId={courseId} trigger={<Button>新增課堂</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>順序</TableHead>
            <TableHead>課堂名稱</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(lessons ?? []).map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell>{lesson.sort_order}</TableCell>
              <TableCell>{lesson.title}</TableCell>
              <TableCell>
                <Badge variant={lesson.is_published ? "default" : "secondary"}>
                  {lesson.is_published ? "已發布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <LessonFormDialog
                  courseId={courseId}
                  lesson={lesson}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
