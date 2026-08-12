import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { DutyHourSlot } from "@/components/duty-roster/duty-shift-card";
import { ensureUpcomingDutyShiftsQuiet } from "@/lib/actions/duty-shifts";
import { DUTY_SLOTS } from "@/lib/duty-roster-config";

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

function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

export default async function DutyRosterPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/duty-roster");

  // Make sure the upcoming Tue/Wed/Thu slots exist so members can claim
  // straight away — no admin action required to "open up" the roster.
  await ensureUpcomingDutyShiftsQuiet(8, null);

  const supabase = await createClient();
  const todayIso = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("duty_shifts")
    .select(
      "id, shift_date, start_time, end_time, assigned_profile_id, branches(suburb), profiles(display_name)",
    )
    .gte("shift_date", todayIso)
    .order("shift_date", { ascending: true })
    .order("start_time", { ascending: true });
  const shifts = data ?? [];

  const weeks = new Map<string, typeof shifts>();
  for (const shift of shifts) {
    const weekStart = mondayOf(shift.shift_date);
    (weeks.get(weekStart) ?? weeks.set(weekStart, []).get(weekStart)!).push(shift);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">排班表</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          山書坊實體店面值班表，歡迎同工／志工自行認領班次。
        </p>
      </div>

      {shifts.length === 0 ? (
        <p className="text-muted-foreground">目前尚無排班資料。</p>
      ) : (
        <div className="space-y-8">
          {Array.from(weeks.entries()).map(([weekStart, weekShifts]) => {
            const dates = Array.from(new Set(weekShifts.map((s) => s.shift_date))).sort();
            const branch = weekShifts[0].branches as unknown as { suburb: string } | null;
            const cellFor = (date: string, start: string) =>
              weekShifts.find((s) => s.shift_date === date && s.start_time === start);

            return (
              <div key={weekStart} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{weekStart} 那週</h2>
                  {branch && (
                    <span className="text-muted-foreground text-xs">{branch.suburb}</span>
                  )}
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-muted-foreground w-16 border-b p-2 text-left font-normal">
                          時段
                        </th>
                        {dates.map((date) => (
                          <th key={date} className="border-b p-2 text-center font-medium">
                            {date.slice(5)}（{WEEKDAY_LABEL[new Date(`${date}T00:00:00`).getDay()]}）
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DUTY_SLOTS.map((slot) => (
                        <tr key={slot.start} className="border-b last:border-0">
                          <td className="text-muted-foreground p-2 text-xs whitespace-nowrap">
                            {slot.start.slice(0, 5)}–{slot.end.slice(0, 5)}
                          </td>
                          {dates.map((date) => {
                            const shift = cellFor(date, slot.start);
                            if (!shift) return <td key={date} className="p-2" />;
                            const assignee = shift.profiles as unknown as {
                              display_name: string | null;
                            } | null;
                            return (
                              <td key={date} className="p-2 text-center">
                                <DutyHourSlot
                                  shiftId={shift.id}
                                  assigneeName={assignee?.display_name ?? null}
                                  isAssigned={shift.assigned_profile_id !== null}
                                  isMine={shift.assigned_profile_id === profile.id}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
