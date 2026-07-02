import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "課程" };

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, instructor_name")
    .eq("is_published", true)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">培訓課程</h1>

      {(courses ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無已發布的課程。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {course.instructor_name && (
                    <p className="text-muted-foreground text-sm">
                      講師：{course.instructor_name}
                    </p>
                  )}
                  {course.description && (
                    <p className="line-clamp-3 text-sm">{course.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
