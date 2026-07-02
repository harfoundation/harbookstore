import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { LessonProgressButton } from "@/components/courses/lesson-progress-button";
import { CourseQaWall } from "@/components/courses/course-qa-wall";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, video_url, course_id, courses(title)")
    .eq("id", lessonId)
    .single();

  if (!lesson || lesson.course_id !== courseId) notFound();

  const course = lesson.courses as unknown as { title: string } | null;

  const [{ data: progress }, { data: qaMessages }] = await Promise.all([
    profile
      ? supabase
          .from("course_progress")
          .select("completed")
          .eq("profile_id", profile.id)
          .eq("lesson_id", lessonId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("course_qa")
      .select("id, body, is_instructor_reply, created_at, author:profiles(display_name)")
      .eq("lesson_id", lessonId)
      .order("created_at"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm">{course?.title}</p>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      {lesson.video_url ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={lesson.video_url}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="bg-muted flex aspect-video w-full items-center justify-center rounded-lg">
          <span className="text-muted-foreground text-sm">尚無影片</span>
        </div>
      )}

      <LessonProgressButton
        lessonId={lesson.id}
        initialCompleted={progress?.completed ?? false}
        isLoggedIn={!!profile}
      />

      <CourseQaWall
        courseId={courseId}
        lessonId={lesson.id}
        messages={(qaMessages ?? []).map((m) => ({
          ...m,
          author: m.author as unknown as { display_name: string | null } | null,
        }))}
        isLoggedIn={!!profile}
      />
    </div>
  );
}
