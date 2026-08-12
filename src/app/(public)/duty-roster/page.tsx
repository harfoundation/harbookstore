import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { DutyShiftCard } from "@/components/duty-roster/duty-shift-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "排班表" };

const WEEKDAY_LABEL: Record<number, string> = {
  0: "週日",
  1: "週一",
  2: "週二",
  3: "週三",
  4: "週四",
  5: "週五",
  6: "週六",
};

export default async function DutyRosterPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/duty-roster");

  const supabase = await createClient();
  const todayIso = new Date().toISOString().slice(0, 10);
  const { data: shifts } = await supabase
    .from("duty_shifts")
    .select(
      "id, shift_date, start_time, end_time, assigned_profile_id, notes, branches(suburb), profiles(display_name)",
    )
    .gte("shift_date", todayIso)
    .order("shift_date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">排班表</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          山書坊實體店面值班表，歡迎同工／志工自行認領班次。
        </p>
      </div>

      {(shifts ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前尚無排班資料。</p>
      ) : (
        <div className="space-y-3">
          {(shifts ?? []).map((shift) => {
            const branch = shift.branches as unknown as { suburb: string } | null;
            const assignee = shift.profiles as unknown as {
              display_name: string | null;
            } | null;
            const weekday = WEEKDAY_LABEL[new Date(shift.shift_date).getDay()];
            return (
              <DutyShiftCard
                key={shift.id}
                shiftId={shift.id}
                dateLabel={`${shift.shift_date}（${weekday}）`}
                timeLabel={`${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`}
                branchLabel={branch?.suburb ?? null}
                assigneeName={assignee?.display_name ?? null}
                isMine={shift.assigned_profile_id === profile.id}
                notes={shift.notes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
