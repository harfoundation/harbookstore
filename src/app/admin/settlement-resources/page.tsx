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
import { SettlementResourceFormDialog } from "@/components/admin/settlement-resource-form-dialog";
import { DeleteSettlementResourceButton } from "@/components/admin/delete-settlement-resource-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "移民安家資源" };

const CATEGORY_LABELS: Record<string, string> = {
  housing: "買租房安家",
  business: "創業做生意",
  employment_study: "學習就業",
};

export default async function AdminSettlementResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("settlement_resources")
    .select("id, category, title_zh, title_en, body_markdown_zh, body_markdown_en, sort_order, status")
    .order("category")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">移民安家資源</h1>
          <p className="text-muted-foreground text-sm">
            買租房安家、創業做生意、學習就業 — 中英雙語，面向新移民與移民二代
          </p>
        </div>
        <SettlementResourceFormDialog trigger={<Button>新增資源</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>分類</TableHead>
            <TableHead>標題</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(resources ?? []).map((resource) => (
            <TableRow key={resource.id}>
              <TableCell>
                <Badge variant="outline">{CATEGORY_LABELS[resource.category]}</Badge>
              </TableCell>
              <TableCell>
                <div>{resource.title_zh}</div>
                <div className="text-muted-foreground text-xs">{resource.title_en}</div>
              </TableCell>
              <TableCell>
                <Badge variant={resource.status === "published" ? "default" : "secondary"}>
                  {resource.status === "published" ? "已發布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <SettlementResourceFormDialog
                  resource={resource}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
                <DeleteSettlementResourceButton id={resource.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
