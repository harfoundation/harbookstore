import { z } from "zod";

export const memberReferralSchema = z.object({
  referredName: z.string().min(1, "請填寫朋友的名字").max(100),
  referredContact: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});
export type MemberReferralInput = z.infer<typeof memberReferralSchema>;
