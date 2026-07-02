import { z } from "zod";

export const courseFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "請輸入課程名稱").max(200),
  description: z.string().max(2000).optional(),
  instructorName: z.string().max(100).optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int(),
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
