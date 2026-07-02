import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "我的訂單" };

const STATUS_LABEL: Record<string, string> = {
  pending_review: "待確認",
  confirmed: "已確認付款",
  fulfilled: "已出貨",
  cancelled: "已取消",
};

const TYPE_LABEL: Record<string, string> = {
  retail: "零售訂購",
  group_buy: "團購",
  gift: "贈書",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, order_type, status, subtotal_cents, payment_method, created_at, order_items(quantity, unit_price_cents, books(title))",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">我的訂單</h1>

      {(orders ?? []).length === 0 ? (
        <p className="text-muted-foreground">尚未有任何訂單。</p>
      ) : (
        <div className="space-y-4">
          {(orders ?? []).map((order) => (
            <div key={order.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(order.created_at).toLocaleString("zh-TW")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {TYPE_LABEL[order.order_type] ?? order.order_type}
                  </Badge>
                  <Badge>{STATUS_LABEL[order.status] ?? order.status}</Badge>
                </div>
              </div>
              <ul className="text-muted-foreground text-sm">
                {(order.order_items ?? []).map((item, idx) => (
                  <li key={idx}>
                    {(item.books as unknown as { title: string } | null)?.title ??
                      "（書籍）"}{" "}
                    × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium">
                總計：AUD ${(order.subtotal_cents / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
