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
import { MembershipFeeSettingsForm } from "@/components/admin/membership-fee-settings-form";
import { MarkMembershipReceivedButton } from "@/components/admin/mark-membership-received-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "會員登記管理" };

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "銀行轉帳",
  in_person: "親臨繳付",
  to_be_arranged: "待安排",
};

export default async function AdminMembershipPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: registrations }] = await Promise.all([
    supabase.from("membership_fee_settings").select("fee_cents, usage_note").single(),
    supabase
      .from("membership_registrations")
      .select(
        "id, registration_number, fee_cents, payment_method, status, created_at, profiles(display_name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">會員登記管理</h1>

      <MembershipFeeSettingsForm
        feeCents={settings?.fee_cents ?? null}
        usageNote={settings?.usage_note ?? null}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>登記編號</TableHead>
            <TableHead>會員</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>付款方式</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(registrations ?? []).map((reg) => {
            const member = reg.profiles as unknown as { display_name: string | null } | null;
            return (
              <TableRow key={reg.id}>
                <TableCell className="font-medium">{reg.registration_number}</TableCell>
                <TableCell>{member?.display_name ?? "—"}</TableCell>
                <TableCell>
                  {reg.fee_cents != null ? `AUD $${(reg.fee_cents / 100).toFixed(2)}` : "未指定"}
                </TableCell>
                <TableCell>{PAYMENT_LABEL[reg.payment_method]}</TableCell>
                <TableCell>
                  <Badge variant={reg.status === "confirmed" ? "default" : "secondary"}>
                    {reg.status === "confirmed" ? "已收款" : "待確認"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <MarkMembershipReceivedButton
                    registrationId={reg.id}
                    received={reg.status === "confirmed"}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
