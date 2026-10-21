import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { PlantingApplicationForm } from "@/components/planting/planting-application-form";
import { APPLICATION_STATUS_LABEL, PROGRAM, TRACKS } from "@/lib/planting/program";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `申請｜${PROGRAM.name}`,
  robots: { index: false, follow: false },
};

export default async function PlantingApplyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/planting/apply");

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("planting_applications")
    .select("track, status, created_at")
    .eq("profile_id", profile.id)
    .eq("cohort_label", PROGRAM.cohortLabel)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/planting" className="text-muted-foreground text-sm hover:underline">
          ← {PROGRAM.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">申請{PROGRAM.cohortLabel}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          提交後，培訓團隊會與你聯絡安排面談。面談後才需要報名繳費。
        </p>
      </div>

      {application ? (
        <div className="space-y-2 rounded-lg border p-6">
          <p className="font-medium">你已申請{PROGRAM.cohortLabel}</p>
          <p className="text-muted-foreground text-sm">
            學習路徑：{TRACKS[application.track as keyof typeof TRACKS]?.label} ·
            提交日期：
            {new Date(application.created_at).toLocaleDateString("zh-TW")}
          </p>
          <p className="text-sm">
            目前狀態：<Badge>{APPLICATION_STATUS_LABEL[application.status]}</Badge>
          </p>
        </div>
      ) : (
        <PlantingApplicationForm
          defaultName={profile.displayName ?? ""}
          defaultEmail={profile.email ?? ""}
        />
      )}
    </div>
  );
}
