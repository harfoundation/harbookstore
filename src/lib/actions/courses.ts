"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  courseFormSchema,
  courseQaSchema,
  lessonFormSchema,
  type CourseFormInput,
  type CourseQaInput,
  type LessonFormInput,
} from "@/lib/validation/course.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function upsertCourse(input: CourseFormInput): Promise<ActionResult> {
  const parsed = courseFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "課程資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    title: v.title,
    description: v.description || null,
    instructor_name: v.instructorName || null,
    is_published: v.isPublished,
    sort_order: v.sortOrder,
    price_cents: v.priceCents,
    term_label: v.termLabel || null,
    service_category: v.serviceCategory,
    program_level: v.programLevel,
    accreditation_note: v.accreditationNote || null,
  };

  const { error } = v.id
    ? await supabase.from("courses").update(row).eq("id", v.id)
    : await supabase.from("courses").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function submitCourseForReview(
  input: CourseFormInput,
): Promise<ActionResult> {
  const parsed = courseFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "課程資料無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const v = parsed.data;
  const { error } = await supabase.from("courses").insert({
    title: v.title,
    description: v.description || null,
    instructor_name: v.instructorName || null,
    is_published: false,
    sort_order: v.sortOrder,
    price_cents: v.priceCents,
    term_label: v.termLabel || null,
    service_category: v.serviceCategory,
    program_level: v.programLevel,
    accreditation_note: v.accreditationNote || null,
    submitted_by: user.id,
    approval_status: "pending_review",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/partner/submissions");
  return { success: true };
}

const reviewSchema = { approved: true, rejected: true } as const;

export async function adminReviewCourse(
  courseId: string,
  decision: "approved" | "rejected",
  reviewNotes?: string,
): Promise<ActionResult> {
  if (!reviewSchema[decision]) return { success: false, error: "無效的審核結果" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      approval_status: decision,
      review_notes: reviewNotes || null,
      is_published: decision === "approved",
    })
    .eq("id", courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function upsertLesson(input: LessonFormInput): Promise<ActionResult> {
  const parsed = lessonFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "課堂資料無效" };

  const supabase = await createClient();
  const v = parsed.data;
  const row = {
    course_id: v.courseId,
    title: v.title,
    video_url: v.videoUrl || null,
    duration_seconds: v.durationSeconds ?? null,
    sort_order: v.sortOrder,
    is_published: v.isPublished,
  };

  const { error } = v.id
    ? await supabase.from("lessons").update(row).eq("id", v.id)
    : await supabase.from("lessons").insert(row);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/courses/${v.courseId}`);
  revalidatePath(`/courses/${v.courseId}`);
  return { success: true };
}

export async function setLessonProgress(
  lessonId: string,
  completed: boolean,
  lastPositionSeconds?: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { error } = await supabase.from("course_progress").upsert(
    {
      profile_id: user.id,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_position_seconds: lastPositionSeconds ?? 0,
    },
    { onConflict: "profile_id,lesson_id" },
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/course-progress");
  return { success: true };
}

export async function postCourseQa(input: CourseQaInput): Promise<ActionResult> {
  const parsed = courseQaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "內容無效" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "請先登入" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("course_qa").insert({
    course_id: parsed.data.courseId,
    lesson_id: parsed.data.lessonId || null,
    parent_id: parsed.data.parentId || null,
    author_id: user.id,
    body: parsed.data.body,
    is_instructor_reply: profile?.role === "instructor" || profile?.role === "admin",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/courses/${parsed.data.courseId}`);
  return { success: true };
}
