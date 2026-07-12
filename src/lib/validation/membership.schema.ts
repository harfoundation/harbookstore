import { z } from "zod";

export const membershipRegistrationSchema = z.object({
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
});
export type MembershipRegistrationInput = z.infer<typeof membershipRegistrationSchema>;

export const membershipFeeSettingsSchema = z.object({
  feeCents: z.number().int().min(0).nullable(),
  usageNote: z.string().max(2000).optional(),
});
export type MembershipFeeSettingsInput = z.infer<typeof membershipFeeSettingsSchema>;
