"use client";

import { adminReviewCourse } from "@/lib/actions/courses";
import { ReviewActions } from "@/components/admin/review-actions";

export function CourseReviewActions({ courseId }: { courseId: string }) {
  return (
    <ReviewActions
      onReview={(decision, notes) => adminReviewCourse(courseId, decision, notes)}
    />
  );
}
