import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "登入" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
