import type { Metadata } from "next";
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
import { BookableServiceFormDialog } from "@/components/admin/bookable-service-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理可預約服務" };

const CATEGORY_LABELS: Record<string, string> = {
  cafe_coop: "Co-op / Cafe",
  consultation: "諮詢／面談",
  venue_hire: "場地租借",
  other: "其他",
};

export default async function AdminBookableServicesPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: branches }] = await Promise.all([
    supabase
      .from("bookable_services")
      .select(
        "id, branch_id, name, description, category, is_active, sort_order, branches(suburb)",
      )
      .order("sort_order"),
    supabase.from("branches").select("id, suburb").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">可預約服務管理</h1>
        <BookableServiceFormDialog
          branches={branches ?? []}
          trigger={<Button>新增服務</Button>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>分類</TableHead>
            <TableHead>分店</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(services ?? []).map((service) => {
            const branch = service.branches as unknown as { suburb: string } | null;
            return (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{CATEGORY_LABELS[service.category]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {branch?.suburb ?? "（不限分店）"}
                </TableCell>
                <TableCell>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "開放中" : "已停用"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end">
                  <BookableServiceFormDialog
                    service={service}
                    branches={branches ?? []}
                    trigger={
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    }
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
