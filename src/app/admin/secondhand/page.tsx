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
import { SecondhandItemFormDialog } from "@/components/admin/secondhand-item-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理二手商品" };

const CONDITION_LABELS: Record<string, string> = {
  like_new: "近全新",
  good: "良好",
  fair: "尚可",
  well_loved: "使用痕跡明顯",
};

const STATUS_LABELS: Record<string, string> = {
  available: "可購買",
  reserved: "已預訂",
  sold: "已售出",
};

export default async function AdminSecondhandPage() {
  const supabase = await createClient();
  const [{ data: items }, { data: categories }, { data: branches }] = await Promise.all([
    supabase
      .from("secondhand_items")
      .select(
        "id, title, author, category_id, condition, description, price_cents, branch_id, status",
      )
      .order("created_at", { ascending: false }),
    supabase.from("book_categories").select("id, name_zh").order("sort_order"),
    supabase.from("branches").select("id, suburb").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">二手商品管理</h1>
        <SecondhandItemFormDialog
          categories={categories ?? []}
          branches={branches ?? []}
          trigger={<Button>新增商品</Button>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>品名</TableHead>
            <TableHead>狀況</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(items ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.title}
                {item.author && (
                  <span className="text-muted-foreground"> — {item.author}</span>
                )}
              </TableCell>
              <TableCell>{CONDITION_LABELS[item.condition]}</TableCell>
              <TableCell>AUD ${(item.price_cents / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={item.status === "available" ? "default" : "secondary"}>
                  {STATUS_LABELS[item.status]}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <SecondhandItemFormDialog
                  item={item}
                  categories={categories ?? []}
                  branches={branches ?? []}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
