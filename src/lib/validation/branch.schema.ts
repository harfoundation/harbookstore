import { z } from "zod";

export const branchFormSchema = z.object({
  id: z.string().uuid().optional(),
  state: z.string().min(1, "請輸入州別").max(10),
  city: z.string().min(1, "請輸入城市").max(100),
  suburb: z.string().min(1, "請輸入分店所在區域").max(100),
  address: z.string().max(300).optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});
export type BranchFormInput = z.infer<typeof branchFormSchema>;
