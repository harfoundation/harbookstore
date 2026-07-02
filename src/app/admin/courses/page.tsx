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

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理課程" };

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, instructor_name, is_published, sort_order, description")
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
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(courses ?? []).map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.title}</TableCell>
              <TableCell>{course.instructor_name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={course.is_published ? "default" : "secondary"}>
                  {course.is_published ? "已發布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
