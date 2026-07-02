import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "註冊" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-12">
      <SignupForm />
    </div>
  );
}
