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
import { CongregationFormDialog } from "@/components/admin/congregation-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "堂會管理" };

const PERIOD_LABELS: Record<string, string> = {
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
};

export default async function AdminCongregationsPage({
  searchParams,
}: {
  searchParams: Promise<{ church?: string }>;
}) {
  const { church } = await searchParams;
  const supabase = await createClient();

  const { data: churchRow } = await supabase
    .from("churches")
    .select("id, name_zh")
    .eq("slug", church ?? "wesley-boxhill")
    .single();

  const churchId = churchRow?.id;

  const { data: congregations } = await supabase
    .from("congregations")
    .select("id, name, service_period, sort_order, is_active")
    .eq("church_id", churchId ?? "")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">堂會管理</h1>
          {churchRow && (
            <p className="text-muted-foreground text-sm">{churchRow.name_zh}</p>
          )}
        </div>
        {churchId && (
          <CongregationFormDialog churchId={churchId} trigger={<Button>新增堂會</Button>} />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>時段</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(congregations ?? []).map((cong) => (
            <TableRow key={cong.id}>
              <TableCell>{cong.name}</TableCell>
              <TableCell>{PERIOD_LABELS[cong.service_period]}</TableCell>
              <TableCell>
                <Badge variant={cong.is_active ? "default" : "secondary"}>
                  {cong.is_active ? "啟用中" : "已停用"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {churchId && (
                  <CongregationFormDialog
                    churchId={churchId}
                    congregation={cong}
                    trigger={
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    }
                  />
                )}
                <Button
                  render={<Link href={`/admin/congregations/${cong.id}/roster`} />}
                  size="sm"
                >
                  管理名單
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
