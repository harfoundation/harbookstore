import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarkDonationReceivedButton } from "@/components/admin/mark-donation-received-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "奉獻管理" };

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "銀行轉帳",
  in_person: "親臨繳付",
  to_be_arranged: "待安排",
};

export default async function AdminDonationsPage() {
  const supabase = await createClient();
  const { data: pledges } = await supabase
    .from("donation_pledges")
    .select(
      "id, pledge_number, donor_name, donor_email, donor_phone, amount_cents, purpose_note, payment_method, status, created_at",
    )
    .order("created_at", { ascending: false });

  const totalConfirmedCents = (pledges ?? [])
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">奉獻管理</h1>
        <p className="text-muted-foreground text-sm">
          已確認收款總額：AUD ${(totalConfirmedCents / 100).toFixed(2)}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>奉獻編號</TableHead>
            <TableHead>奉獻人</TableHead>
            <TableHead>聯絡方式</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>付款方式</TableHead>
            <TableHead>留言</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(pledges ?? []).map((pledge) => (
            <TableRow key={pledge.id}>
              <TableCell className="font-medium">{pledge.pledge_number}</TableCell>
              <TableCell>{pledge.donor_name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {pledge.donor_email || pledge.donor_phone || "—"}
              </TableCell>
              <TableCell>
                {pledge.amount_cents != null
                  ? `AUD $${(pledge.amount_cents / 100).toFixed(2)}`
                  : "未指定"}
              </TableCell>
              <TableCell>{PAYMENT_LABEL[pledge.payment_method]}</TableCell>
              <TableCell className="max-w-48 truncate text-sm">
                {pledge.purpose_note || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={pledge.status === "confirmed" ? "default" : "secondary"}>
                  {pledge.status === "confirmed" ? "已收款" : "待確認"}
                </Badge>
              </TableCell>
              <TableCell>
                <MarkDonationReceivedButton
                  pledgeId={pledge.id}
                  received={pledge.status === "confirmed"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
