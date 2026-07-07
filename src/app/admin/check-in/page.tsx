import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AttendanceCheckIn } from "@/components/admin/attendance-check-in";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "主日人員登記" };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ congregationId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: congregations } = await supabase
    .from("congregations")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  if (!congregations || congregations.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold">主日人員登記</h1>
        <p className="text-muted-foreground">
          尚未設定任何堂會，請先到「堂會管理」新增堂會與名單。
        </p>
      </div>
    );
  }

  const selectedCongregationId = params.congregationId ?? congregations[0].id;
  const serviceDate = params.date ?? todayIso();

  const [{ data: members }, { data: session }] = await Promise.all([
    supabase
      .from("congregation_members")
      .select("id, display_name, member_type")
      .eq("congregation_id", selectedCongregationId)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("attendance_sessions")
      .select("id")
      .eq("congregation_id", selectedCongregationId)
      .eq("service_date", serviceDate)
      .maybeSingle(),
  ]);

  let checkedInMemberIds: string[] = [];
  let walkIns: { id: string; display_name: string }[] = [];

  if (session) {
    const { data: checkins } = await supabase
      .from("attendance_checkins")
      .select("id, member_id, display_name, member_type")
      .eq("session_id", session.id);

    checkedInMemberIds = (checkins ?? [])
      .filter((c) => c.member_id !== null)
      .map((c) => c.member_id as string);
    walkIns = (checkins ?? [])
      .filter((c) => c.member_type === "new_friend")
      .map((c) => ({ id: c.id, display_name: c.display_name }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">主日人員登記</h1>
      <AttendanceCheckIn
        congregations={congregations}
        selectedCongregationId={selectedCongregationId}
        serviceDate={serviceDate}
        members={
          (members ?? []) as {
            id: string;
            display_name: string;
            member_type: "regular" | "co_worker";
          }[]
        }
        initialCheckedInMemberIds={checkedInMemberIds}
        initialWalkIns={walkIns}
      />
    </div>
  );
}
