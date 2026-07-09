import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusSelect } from "@/components/admin/application-status-select";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "同工/志工申請" };

const TYPE_LABEL: Record<string, string> = {
  volunteer: "志工／義工",
  paid_staff: "受薪同工",
  book_review_writer: "書評寫作",
};

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("team_applications")
    .select(
      "id, full_name, contact_email, contact_phone, application_type, role_interest, message, status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">同工／志工申請</h1>

      <div className="space-y-4">
        {(applications ?? []).map((app) => (
          <div key={app.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {app.full_name}{" "}
                  <Badge variant="outline">{TYPE_LABEL[app.application_type]}</Badge>
                </p>
                <p className="text-muted-foreground text-xs">
                  {app.contact_email}
                  {app.contact_phone ? ` · ${app.contact_phone}` : ""} ·{" "}
                  {new Date(app.created_at).toLocaleDateString("zh-TW")}
                </p>
              </div>
              <ApplicationStatusSelect applicationId={app.id} status={app.status} />
            </div>
            {app.role_interest && (
              <p className="text-sm">有興趣的崗位：{app.role_interest}</p>
            )}
            {app.message && (
              <p className="text-muted-foreground text-sm">{app.message}</p>
            )}
          </div>
        ))}
        {(applications ?? []).length === 0 && (
          <p className="text-muted-foreground">目前沒有申請。</p>
        )}
      </div>
    </div>
  );
}
