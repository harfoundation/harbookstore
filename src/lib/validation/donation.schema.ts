import { z } from "zod";

export const donationPledgeSchema = z.object({
  donorName: z.string().min(1, "請填寫姓名").max(100),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().max(30).optional(),
  amountCents: z.number().int().min(0).nullable(),
  purposeNote: z.string().max(500).optional(),
  paymentMethod: z.enum(["bank_transfer", "in_person"]),
});
export type DonationPledgeInput = z.infer<typeof donationPledgeSchema>;
