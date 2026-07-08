import { z } from "zod";

export const congregationFormSchema = z.object({
  id: z.string().uuid().optional(),
  churchId: z.string().uuid(),
  name: z.string().min(1, "請輸入堂會名稱").max(100),
  servicePeriod: z.enum(["morning", "afternoon", "evening"]),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
export type CongregationFormInput = z.infer<typeof congregationFormSchema>;

export const congregationMemberFormSchema = z.object({
  id: z.string().uuid().optional(),
  congregationId: z.string().uuid(),
  displayName: z.string().min(1, "請輸入姓名").max(100),
  memberType: z.enum(["regular", "co_worker"]),
  notes: z.string().max(300).optional(),
  isActive: z.boolean(),
});
export type CongregationMemberFormInput = z.infer<typeof congregationMemberFormSchema>;

export const toggleCheckinSchema = z.object({
  congregationId: z.string().uuid(),
  serviceDate: z.string().min(1),
  memberId: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  memberType: z.enum(["regular", "co_worker"]),
});
export type ToggleCheckinInput = z.infer<typeof toggleCheckinSchema>;

export const addWalkInSchema = z.object({
  congregationId: z.string().uuid(),
  serviceDate: z.string().min(1),
  displayName: z.string().min(1, "請輸入姓名").max(100),
});
export type AddWalkInInput = z.infer<typeof addWalkInSchema>;

export const removeCheckinSchema = z.object({
  checkinId: z.string().uuid(),
});
export type RemoveCheckinInput = z.infer<typeof removeCheckinSchema>;
