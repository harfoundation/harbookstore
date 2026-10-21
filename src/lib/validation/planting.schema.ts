import { z } from "zod";

export const plantingApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "請填寫姓名").max(100),
  contactEmail: z.string().trim().email("請填寫有效的電郵"),
  contactPhone: z.string().trim().max(40).optional(),
  homeChurch: z.string().trim().max(200).optional(),
  refereeName: z.string().trim().max(100).optional(),
  refereeContact: z.string().trim().max(200).optional(),
  track: z.enum(["practical", "foundation_practical"]),
  seminaryBackground: z.string().trim().max(1000).optional(),
  plantingVision: z
    .string()
    .trim()
    .min(10, "請簡單描述你的植堂意向（至少 10 字）")
    .max(3000),
  weeklyHours: z.number().int().min(0).max(80).optional(),
});
export type PlantingApplicationInput = z.infer<typeof plantingApplicationSchema>;

export const plantingReviewSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["submitted", "interview", "accepted", "waitlist", "declined"]),
  interviewNotes: z.string().trim().max(5000).optional(),
});
export type PlantingReviewInput = z.infer<typeof plantingReviewSchema>;
