import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/profile");

  return <div className="space-y-6">{children}</div>;
}
