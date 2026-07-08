import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChurchFormDialog } from "@/components/admin/church-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "堂會管理（多堂會服務）" };

const BILLING_STATUS_LABELS: Record<string, string> = {
  internal: "本堂（免費）",
  trial: "試用中",
  pending_invoice: "待請款",
  paid: "已付款",
  overdue: "逾期未付",
  cancelled: "已終止",
};

export default async function AdminChurchesPage() {
  const supabase = await createClient();
  const { data: churches } = await supabase
    .from("churches")
    .select(
      "id, slug, name_zh, name_en, contact_name, contact_email, contact_phone, is_active, billing_status, billing_plan_cents, billing_notes",
    )
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">堂會管理（多堂會服務）</h1>
          <p className="text-muted-foreground text-sm">
            管理每個堂會的每週聚會、敬拜詩歌、講道 PPT、報名與通知。
          </p>
        </div>
        <ChurchFormDialog trigger={<Button>新增堂會</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>堂會</TableHead>
            <TableHead>收費狀態</TableHead>
            <TableHead>月費</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(churches ?? []).map((church) => (
            <TableRow key={church.id}>
              <TableCell>
                <Link
                  href={`/admin/churches/${church.id}`}
                  className="font-medium hover:underline"
                >
                  {church.name_zh}
                </Link>
                {church.name_en && (
                  <p className="text-muted-foreground text-xs">{church.name_en}</p>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    church.billing_status === "paid" || church.billing_status === "internal"
                      ? "default"
                      : church.billing_status === "overdue"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {BILLING_STATUS_LABELS[church.billing_status]}
                </Badge>
              </TableCell>
              <TableCell>
                {church.billing_plan_cents != null
                  ? `AUD $${(church.billing_plan_cents / 100).toFixed(2)}`
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={church.is_active ? "default" : "secondary"}>
                  {church.is_active ? "啟用中" : "已停用"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <ChurchFormDialog
                  church={church}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
                <Button render={<Link href={`/admin/churches/${church.id}`} />} size="sm">
                  管理
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
