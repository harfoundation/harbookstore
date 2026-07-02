import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, instructor_name")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, duration_seconds")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order");

  const { data: progress } = profile
    ? await supabase
        .from("course_progress")
        .select("lesson_id, completed")
        .eq("profile_id", profile.id)
        .in(
          "lesson_id",
          (lessons ?? []).map((l) => l.id),
        )
    : { data: [] };

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.instructor_name && (
          <p className="text-muted-foreground mt-1">講師：{course.instructor_name}</p>
        )}
        {course.description && (
          <p className="mt-2 text-sm leading-relaxed">{course.description}</p>
        )}
      </div>

      <div className="divide-y rounded-lg border">
        {(lessons ?? []).map((lesson, idx) => (
          <Link
            key={lesson.id}
            href={`/courses/${courseId}/lessons/${lesson.id}`}
            className="hover:bg-muted flex items-center justify-between gap-4 p-4"
          >
            <span>
              {idx + 1}. {lesson.title}
            </span>
            {completedLessonIds.has(lesson.id) && <Badge>已完成</Badge>}
          </Link>
        ))}
        {(lessons ?? []).length === 0 && (
          <p className="text-muted-foreground p-4">此課程暫無已發布課堂。</p>
        )}
      </div>
    </div>
  );
}
