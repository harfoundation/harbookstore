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
import { ArticleFormDialog } from "@/components/admin/article-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理書評文章" };

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已發布",
  archived: "已封存",
};

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, body_markdown, related_category_id, status")
      .order("created_at", { ascending: false }),
    supabase.from("book_categories").select("id, name_zh").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">書評文章管理</h1>
        <ArticleFormDialog
          categories={categories ?? []}
          trigger={<Button>新增文章</Button>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>標題</TableHead>
            <TableHead>網址代稱</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(articles ?? []).map((article) => (
            <TableRow key={article.id}>
              <TableCell>{article.title}</TableCell>
              <TableCell className="text-muted-foreground">{article.slug}</TableCell>
              <TableCell>
                <Badge variant={article.status === "published" ? "default" : "secondary"}>
                  {STATUS_LABEL[article.status]}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end">
                <ArticleFormDialog
                  article={article}
                  categories={categories ?? []}
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
