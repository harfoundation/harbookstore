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
import { ReferralStatusSelect } from "@/components/admin/referral-status-select";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "會員推薦" };

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const { data: referrals } = await supabase
    .from("member_referrals")
    .select(
      "id, referred_name, referred_contact, message, status, created_at, profiles!member_referrals_referred_by_fkey(display_name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">會員推薦</h1>
        <p className="text-muted-foreground text-sm">
          會員推薦朋友加入山書坊的紀錄，可在此追蹤是否已成功加入。
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>推薦人</TableHead>
            <TableHead>被推薦人</TableHead>
            <TableHead>聯絡方式</TableHead>
            <TableHead>留言</TableHead>
            <TableHead>時間</TableHead>
            <TableHead>狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(referrals ?? []).map((referral) => {
            const referrer = referral.profiles as unknown as {
              display_name: string | null;
            } | null;
            return (
              <TableRow key={referral.id}>
                <TableCell>{referrer?.display_name ?? "—"}</TableCell>
                <TableCell className="font-medium">{referral.referred_name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {referral.referred_contact || "—"}
                </TableCell>
                <TableCell className="max-w-48 truncate text-sm">
                  {referral.message || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(referral.created_at).toLocaleDateString("zh-TW")}
                </TableCell>
                <TableCell>
                  <ReferralStatusSelect referralId={referral.id} status={referral.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
