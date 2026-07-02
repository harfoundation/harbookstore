import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "學習進度" };

export default async function CourseProgressPage() {
  const supabase = await createClient();
  const { data: progress } = await supabase
    .from("course_progress")
    .select("completed, completed_at, lessons(id, title, course_id, courses(title))")
    .order("completed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">學習進度</h1>

      {(progress ?? []).length === 0 ? (
        <p className="text-muted-foreground">尚未開始任何課堂。</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {(progress ?? []).map((p, idx) => {
            const lesson = p.lessons as unknown as {
              id: string;
              title: string;
              course_id: string;
              courses: { title: string } | null;
            } | null;
            if (!lesson) return null;
            return (
              <Link
                key={idx}
                href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
                className="hover:bg-muted flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-muted-foreground text-xs">{lesson.courses?.title}</p>
                </div>
                {p.completed && <Badge>已完成</Badge>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
