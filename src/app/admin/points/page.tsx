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
import { AdjustPointsDialog } from "@/components/admin/adjust-points-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "會員點數" };

const REASON_LABELS: Record<string, string> = {
  donation: "奉獻確認",
  membership: "會員登記",
  referral: "推薦朋友加入",
  borrow_returned: "借閱歸還",
  admin_adjustment: "管理員調整",
};

export default async function AdminPointsPage() {
  const supabase = await createClient();
  const [{ data: totals }, { data: recentEntries }] = await Promise.all([
    supabase
      .from("member_points_totals")
      .select("profile_id, display_name, total_points")
      .gt("total_points", 0)
      .order("total_points", { ascending: false })
      .limit(50),
    supabase
      .from("member_points_ledger")
      .select(
        "id, points, reason, note, created_at, profiles!member_points_ledger_profile_id_fkey(display_name)",
      )
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">會員點數</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          純內部參與紀錄與表揚機制，無金錢價值，不可兌換或轉讓。奉獻確認、會員登記、成功推薦朋友、借閱歸還時會自動累積，也可手動調整。
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">點數排行</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>會員</TableHead>
              <TableHead>總點數</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(totals ?? [])
              .filter((row): row is typeof row & { profile_id: string } => !!row.profile_id)
              .map((row) => (
                <TableRow key={row.profile_id}>
                  <TableCell>{row.display_name ?? "—"}</TableCell>
                  <TableCell className="font-medium">{row.total_points}</TableCell>
                  <TableCell>
                    <AdjustPointsDialog
                      profileId={row.profile_id}
                      displayName={row.display_name ?? "此會員"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            {(totals ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground text-center">
                  目前尚無點數紀錄
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">最近紀錄</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>會員</TableHead>
              <TableHead>點數</TableHead>
              <TableHead>原因</TableHead>
              <TableHead>備註</TableHead>
              <TableHead>時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(recentEntries ?? []).map((entry) => {
              const member = entry.profiles as unknown as { display_name: string | null } | null;
              return (
                <TableRow key={entry.id}>
                  <TableCell>{member?.display_name ?? "—"}</TableCell>
                  <TableCell className={entry.points < 0 ? "text-destructive" : ""}>
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </TableCell>
                  <TableCell>{REASON_LABELS[entry.reason] ?? entry.reason}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {entry.note ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(entry.created_at).toLocaleString("zh-TW")}
                  </TableCell>
                </TableRow>
              );
            })}
            {(recentEntries ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  目前尚無紀錄
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
