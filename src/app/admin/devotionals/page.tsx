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
import { DevotionalBookFormDialog } from "@/components/admin/devotional-book-form-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理靈修文集" };

const STATUS_LABEL: Record<string, string> = { draft: "草稿", published: "已發布" };

export default async function AdminDevotionalsPage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("devotional_books")
    .select(
      "id, slug, title_zh, title_en, author_name, author_bio_markdown, declaration_markdown, preface_markdown, afterword_markdown, topic_index, status",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">靈修文集管理</h1>
        <DevotionalBookFormDialog trigger={<Button>新增書籍</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>書名</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(books ?? []).map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <Link href={`/admin/devotionals/${book.id}`} className="hover:underline">
                  {book.title_zh}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{book.author_name}</TableCell>
              <TableCell>
                <Badge variant={book.status === "published" ? "default" : "secondary"}>
                  {STATUS_LABEL[book.status]}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  render={<Link href={`/devotionals/${book.slug}`} />}
                  variant="outline"
                  size="sm"
                >
                  預覽
                </Button>
                <DevotionalBookFormDialog
                  book={book}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
                <Button
                  render={<Link href={`/admin/devotionals/${book.id}`} />}
                  size="sm"
                >
                  管理篇章
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
