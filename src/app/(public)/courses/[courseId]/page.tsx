import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { CourseEnrollCard } from "@/components/courses/course-enroll-card";

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
    .select(
      "id, title, description, instructor_name, term_label, price_cents, training_fee_cents, book_fee_cents, instructor_fee_cents",
    )
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

  const { data: existingEnrollment } = profile
    ? await supabase
        .from("order_items")
        .select("orders!inner(order_number, buyer_id, status)")
        .eq("course_id", courseId)
        .eq("orders.buyer_id", profile.id)
        .neq("orders.status", "cancelled")
        .limit(1)
        .maybeSingle()
    : { data: null };

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
        {course.term_label && (
          <p className="text-muted-foreground mt-1 text-sm">期限：{course.term_label}</p>
        )}
        {course.description && (
          <p className="mt-2 text-sm leading-relaxed">{course.description}</p>
        )}
      </div>

      <CourseEnrollCard
        courseId={courseId}
        fees={{
          priceCents: course.price_cents,
          trainingFeeCents: course.training_fee_cents,
          bookFeeCents: course.book_fee_cents,
          instructorFeeCents: course.instructor_fee_cents,
        }}
        isLoggedIn={!!profile}
        existingOrderNumber={existingEnrollment?.orders.order_number ?? null}
      />

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
