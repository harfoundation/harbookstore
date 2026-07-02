import type { Metadata } from "next";
import Link from "next/link";
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
import { CourseFormDialog } from "@/components/admin/course-form-dialog";
import { CourseReviewActions } from "@/components/admin/course-review-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理課程" };

const APPROVAL_LABEL: Record<string, string> = {
  draft: "草稿",
  pending_review: "待審核",
  approved: "已核准",
  rejected: "已拒絕",
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, title, instructor_name, is_published, sort_order, description, price_cents, term_label, service_category, program_level, accreditation_note, approval_status, review_notes, submitted_by, profiles!courses_submitted_by_fkey(display_name)",
    )
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">課程管理</h1>
        <CourseFormDialog trigger={<Button>新增課程</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>課程名稱</TableHead>
            <TableHead>講師</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>提交者</TableHead>
            <TableHead>審核狀態</TableHead>
            <TableHead>發布狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(courses ?? []).map((course) => {
            const submitter = course.profiles as unknown as {
              display_name: string | null;
            } | null;
            return (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.instructor_name ?? "—"}</TableCell>
                <TableCell>
                  {course.price_cents != null
                    ? `$${(course.price_cents / 100).toFixed(2)}`
                    : "免費"}
                </TableCell>
                <TableCell>{submitter?.display_name ?? "（管理員）"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      course.approval_status === "approved" ? "default" : "secondary"
                    }
                  >
                    {APPROVAL_LABEL[course.approval_status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? "已發布" : "草稿"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-1">
                  {course.approval_status === "pending_review" && (
                    <CourseReviewActions courseId={course.id} />
                  )}
                  <CourseFormDialog
                    course={course}
                    trigger={
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    }
                  />
                  <Button
                    render={<Link href={`/admin/courses/${course.id}`} />}
                    variant="secondary"
                    size="sm"
                  >
                    管理課堂
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
