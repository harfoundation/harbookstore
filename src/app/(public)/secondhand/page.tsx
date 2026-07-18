import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondhandBuyButton } from "@/components/secondhand/secondhand-buy-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "二手品選購" };

const CONDITION_LABELS: Record<string, string> = {
  brand_new: "全新",
  near_new: "近全新",
  good: "良好",
  fair: "普通",
  poor: "差強人意",
};

export default async function SecondhandPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("secondhand_items")
    .select(
      "id, title, author, condition, description, price_cents, original_price_cents, status, book_categories(name_zh), branches(suburb)",
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二手品選購</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          弟兄姊妹捐贈或寄售的二手書籍與物品，數量有限，售完即止。
        </p>
      </div>

      {(items ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無可選購的二手品。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(items ?? []).map((item) => {
            const category = item.book_categories as unknown as {
              name_zh: string;
            } | null;
            const branch = item.branches as unknown as { suburb: string } | null;
            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.author && (
                    <p className="text-muted-foreground text-sm">作者：{item.author}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">{CONDITION_LABELS[item.condition]}</Badge>
                    {category && <Badge variant="secondary">{category.name_zh}</Badge>}
                    {branch && <Badge variant="secondary">{branch.suburb}</Badge>}
                  </div>
                  {item.description && (
                    <p className="line-clamp-3 text-sm">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-baseline gap-2">
                      <span className="font-semibold">
                        AUD ${(item.price_cents / 100).toFixed(2)}
                      </span>
                      {item.original_price_cents != null && (
                        <span className="text-muted-foreground text-xs line-through">
                          原價 ${(item.original_price_cents / 100).toFixed(2)}
                        </span>
                      )}
                    </span>
                    <SecondhandBuyButton itemId={item.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
