import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "書評" };

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, body_markdown, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">書評委員會</h1>
        <Button variant="outline" render={<Link href="/articles/write" />}>
          參與書評寫作 →
        </Button>
      </div>

      {(articles ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無已發布的文章。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(articles ?? []).map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {article.body_markdown}
                  </p>
                  {article.published_at && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      {new Date(article.published_at).toLocaleDateString("zh-TW")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
