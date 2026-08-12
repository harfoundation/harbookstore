import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DutyRosterGenerateForm } from "@/components/admin/duty-roster-generate-form";
import { DutyShiftRowActions } from "@/components/admin/duty-shift-row-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "排班表管理" };

export default async function AdminDutyRosterPage() {
  const supabase = await createClient();
  const todayIso = new Date().toISOString().slice(0, 10);
  const [{ data: shifts }, { data: branches }] = await Promise.all([
    supabase
      .from("duty_shifts")
      .select(
        "id, shift_date, start_time, end_time, notes, branches(suburb), profiles(display_name)",
      )
      .gte("shift_date", todayIso)
      .order("shift_date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.from("branches").select("id, suburb").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">排班表管理</h1>

      <DutyRosterGenerateForm branches={branches ?? []} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日期</TableHead>
            <TableHead>時段</TableHead>
            <TableHead>分店</TableHead>
            <TableHead>認領人</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(shifts ?? []).map((shift) => {
            const branch = shift.branches as unknown as { suburb: string } | null;
            const assignee = shift.profiles as unknown as {
              display_name: string | null;
            } | null;
            return (
              <TableRow key={shift.id}>
                <TableCell>{shift.shift_date}</TableCell>
                <TableCell>
                  {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                </TableCell>
                <TableCell>{branch?.suburb ?? "—"}</TableCell>
                <TableCell>{assignee?.display_name ?? "尚未認領"}</TableCell>
                <TableCell>
                  <DutyShiftRowActions shiftId={shift.id} isAssigned={!!assignee} />
                </TableCell>
              </TableRow>
            );
          })}
          {(shifts ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                目前尚無班次，請先產生班次
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
