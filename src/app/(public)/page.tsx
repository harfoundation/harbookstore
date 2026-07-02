import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("book_categories")
    .select("id, slug, name_zh, subtitle_zh")
    .order("sort_order");

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">山書房 Har Bookstore</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance">
          陪你回到耶穌，建立根基——培訓課程、書評專欄、團購贈書與免費借閱，
          一個以人為本的基督教書籍事工。
        </p>
        <div className="flex justify-center gap-3">
          <Button render={<Link href="/catalog" />} size="lg">
            瀏覽書目
          </Button>
          <Button render={<Link href="/lending" />} size="lg" variant="outline">
            免費借書
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">閱讀路徑推薦</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name_zh}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{category.subtitle_zh}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
