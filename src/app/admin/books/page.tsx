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
import { BookFormDialog } from "@/components/admin/book-form-dialog";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理書籍" };

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const [{ data: books }, { data: categories }] = await Promise.all([
    supabase
      .from("books")
      .select(
        "id, category_id, poster_number, title, author, translator, isbn, description, price_cents, procurement_status, stock_qty, is_lendable, is_active",
      )
      .order("poster_number"),
    supabase.from("book_categories").select("id, name_zh").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">書籍管理</h1>
        <BookFormDialog
          categories={categories ?? []}
          trigger={<Button>新增書籍</Button>}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>書名</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>上架</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(books ?? []).map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.poster_number ?? "—"}</TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author ?? "—"}</TableCell>
              <TableCell>
                {book.price_cents != null
                  ? `$${(book.price_cents / 100).toFixed(2)}`
                  : "—"}
              </TableCell>
              <TableCell>{book.procurement_status}</TableCell>
              <TableCell>
                <Badge variant={book.is_active ? "default" : "secondary"}>
                  {book.is_active ? "上架中" : "已下架"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <BookFormDialog
                  book={book}
                  categories={categories ?? []}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
                <ToggleActiveButton bookId={book.id} isActive={book.is_active} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
