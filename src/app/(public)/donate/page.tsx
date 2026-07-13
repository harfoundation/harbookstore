import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { DonateForm } from "@/components/donate-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "奉獻支持" };

export default async function DonatePage() {
  const profile = await getCurrentProfile();

  return (
    <DonateForm
      defaultName={profile?.displayName ?? ""}
      defaultEmail={profile?.email ?? ""}
    />
  );
}
