import { z } from "zod";
import { TRANSCRIPT_LANGUAGE_CODES } from "@/lib/courses/transcript-languages";

export const serviceCategories = [
  "course",
  "workshop",
  "diploma",
  "retreat",
  "outreach",
  "ministry_service",
] as const;

export const programLevels = [
  "certificate_i",
  "certificate_ii",
  "certificate_iii",
  "certificate_iv",
  "diploma_1",
  "diploma_2",
  "diploma_3",
  "diploma_4",
] as const;

export const courseFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "請輸入課程名稱").max(200),
  description: z.string().max(2000).optional(),
  instructorName: z.string().max(100).optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int(),
  priceCents: z.number().int().min(0).nullable(),
  // 培訓費 + 書費 + 講師費 (staff only). When any is set, the database keeps
  // price_cents equal to their sum; leave all null for a plain single price.
  trainingFeeCents: z.number().int().min(0).nullable().optional(),
  bookFeeCents: z.number().int().min(0).nullable().optional(),
  instructorFeeCents: z.number().int().min(0).nullable().optional(),
  termLabel: z.string().max(100).optional(),
  serviceCategory: z.enum(serviceCategories),
  programLevel: z.enum(programLevels).nullable(),
  accreditationNote: z.string().max(500).optional(),
});
export type CourseFormInput = z.infer<typeof courseFormSchema>;

export const lessonFormSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  title: z.string().min(1, "請輸入課堂名稱").max(200),
  videoUrl: z.string().url().optional().or(z.literal("")),
  durationSeconds: z.number().int().min(0).optional(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});
export type LessonFormInput = z.infer<typeof lessonFormSchema>;

export const courseQaSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  body: z.string().min(1, "請輸入內容").max(2000),
});
export type CourseQaInput = z.infer<typeof courseQaSchema>;

export const lessonTranscriptSchema = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  language: z.enum(TRANSCRIPT_LANGUAGE_CODES),
  isOriginal: z.boolean(),
  content: z.string().trim().min(1, "請貼上講稿內容").max(200_000),
});
export type LessonTranscriptInput = z.infer<typeof lessonTranscriptSchema>;
