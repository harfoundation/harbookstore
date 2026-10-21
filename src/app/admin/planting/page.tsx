import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { PlantingReviewForm } from "@/components/admin/planting-review-form";
import { APPLICATION_STATUS_LABEL, PROGRAM, TRACKS } from "@/lib/planting/program";
import type { PlantingReviewInput } from "@/lib/validation/planting.schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${PROGRAM.name}申請` };

export default async function AdminPlantingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("planting_applications")
    .select(
      "id, cohort_label, full_name, contact_email, contact_phone, home_church, referee_name, referee_contact, track, seminary_background, planting_vision, weekly_hours, status, created_at, planting_application_notes(interview_notes)",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: applications } = await query;

  const { data: all } = await supabase.from("planting_applications").select("status");
  const counts = (all ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{PROGRAM.name}：申請管理</h1>
        <Link href="/planting" className="text-sm underline underline-offset-4">
          查看介紹頁 →
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/planting"
          className={`rounded px-2 py-0.5 ${!status ? "bg-muted font-medium" : "hover:bg-muted"}`}
        >
          全部（{(all ?? []).length}）
        </Link>
        {Object.entries(APPLICATION_STATUS_LABEL).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/planting?status=${key}`}
            className={`rounded px-2 py-0.5 ${status === key ? "bg-muted font-medium" : "hover:bg-muted"}`}
          >
            {label}（{counts[key] ?? 0}）
          </Link>
        ))}
      </nav>

      <div className="space-y-4">
        {(applications ?? []).map((app) => (
          <div key={app.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {app.full_name}{" "}
                  <Badge variant="outline">
                    {TRACKS[app.track as keyof typeof TRACKS]?.label}
                  </Badge>
                </p>
                <p className="text-muted-foreground text-xs">
                  {app.contact_email}
                  {app.contact_phone ? ` · ${app.contact_phone}` : ""} ·{" "}
                  {app.cohort_label} ·{" "}
                  {new Date(app.created_at).toLocaleDateString("zh-TW")}
                </p>
              </div>
              <Badge>{APPLICATION_STATUS_LABEL[app.status]}</Badge>
            </div>

            <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
              {app.home_church && (
                <>
                  <dt className="text-muted-foreground">所屬教會</dt>
                  <dd>{app.home_church}</dd>
                </>
              )}
              {app.referee_name && (
                <>
                  <dt className="text-muted-foreground">推薦人</dt>
                  <dd>
                    {app.referee_name}
                    {app.referee_contact ? `（${app.referee_contact}）` : ""}
                  </dd>
                </>
              )}
              {app.seminary_background && (
                <>
                  <dt className="text-muted-foreground">神學／事奉背景</dt>
                  <dd className="whitespace-pre-wrap">{app.seminary_background}</dd>
                </>
              )}
              <dt className="text-muted-foreground">植堂意向</dt>
              <dd className="whitespace-pre-wrap">{app.planting_vision}</dd>
              {app.weekly_hours != null && (
                <>
                  <dt className="text-muted-foreground">每週可投入</dt>
                  <dd>{app.weekly_hours} 小時</dd>
                </>
              )}
            </dl>

            <PlantingReviewForm
              applicationId={app.id}
              status={app.status as PlantingReviewInput["status"]}
              interviewNotes={app.planting_application_notes?.interview_notes ?? null}
            />
          </div>
        ))}
        {(applications ?? []).length === 0 && (
          <p className="text-muted-foreground">目前沒有申請。</p>
        )}
      </div>
    </div>
  );
}
