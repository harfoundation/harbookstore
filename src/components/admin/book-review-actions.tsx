"use client";

import { adminReviewBook } from "@/lib/actions/books";
import { ReviewActions } from "@/components/admin/review-actions";

export function BookReviewActions({ bookId }: { bookId: string }) {
  return (
    <ReviewActions
      onReview={(decision, notes) => adminReviewBook(bookId, decision, notes)}
    />
  );
}
