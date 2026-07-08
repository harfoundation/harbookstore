"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validation/auth.schema";

export function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.displayName } },
    });
    setSubmitting(false);

    if (error) {
      toast.error("註冊失敗", { description: error.message });
      return;
    }

    toast.success("註冊成功，歡迎加入山書坊！");
    router.push("/");
    router.refresh();
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">註冊</h1>
        <p className="text-muted-foreground text-sm">加入山書坊，開始您的閱讀旅程</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
      >
        使用 Google 註冊
      </Button>

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <div className="bg-border h-px flex-1" />
        或使用電郵
        <div className="bg-border h-px flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">名稱</Label>
          <Input id="displayName" autoComplete="name" {...register("displayName")} />
          {errors.displayName && (
            <p className="text-destructive text-sm">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">電郵</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">密碼</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "註冊中…" : "註冊"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        已經有帳戶？{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          登入
        </Link>
      </p>
    </div>
  );
}
