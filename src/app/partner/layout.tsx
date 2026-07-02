import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/partner/submissions");
  if (profile.role !== "partner" && profile.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">合作夥伴中心</h1>
        <Link
          href="/"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          ← 返回網站
        </Link>
      </div>
      {children}
    </div>
  );
}
