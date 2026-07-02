import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("請輸入有效的電郵地址"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, "請輸入您的名稱").max(60),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
