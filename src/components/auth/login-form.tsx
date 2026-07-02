"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validation/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);

    if (error) {
      toast.error("登入失敗", { description: error.message });
      return;
    }

    toast.success("登入成功");
    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">登入</h1>
        <p className="text-muted-foreground text-sm">歡迎回到山書房</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        使用 Google 登入
      </Button>

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <div className="bg-border h-px flex-1" />
        或使用電郵
        <div className="bg-border h-px flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "登入中…" : "登入"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        還沒有帳戶？{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          立即註冊
        </Link>
      </p>
    </div>
  );
}
