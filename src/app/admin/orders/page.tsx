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
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理訂單" };

const TYPE_LABEL: Record<string, string> = {
  retail: "零售",
  group_buy: "團購",
  gift: "贈書",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, order_type, status, subtotal_cents, payment_method, created_at, profiles(display_name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">訂單管理</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>訂單編號</TableHead>
            <TableHead>買家</TableHead>
            <TableHead>類型</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>付款方式</TableHead>
            <TableHead>狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(orders ?? []).map((order) => {
            const buyer = order.profiles as unknown as {
              display_name: string | null;
            } | null;
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{buyer?.display_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TYPE_LABEL[order.order_type] ?? order.order_type}
                  </Badge>
                </TableCell>
                <TableCell>AUD ${(order.subtotal_cents / 100).toFixed(2)}</TableCell>
                <TableCell>{order.payment_method}</TableCell>
                <TableCell>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
