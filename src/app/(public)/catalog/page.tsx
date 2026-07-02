import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/catalog/book-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "書目" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, booksQuery] = await Promise.all([
    supabase.from("book_categories").select("id, slug, name_zh").order("sort_order"),
    (async () => {
      let query = supabase
        .from("books")
        .select(
          "id, title, author, price_cents, procurement_status, poster_number, category_id",
        )
        .eq("is_active", true)
        .order("poster_number");

      if (category) {
        const { data: cat } = await supabase
          .from("book_categories")
          .select("id")
          .eq("slug", category)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      return query;
    })(),
  ]);

  const books = booksQuery.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">書目</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/catalog">
          <Badge variant={!category ? "default" : "outline"}>全部</Badge>
        </Link>
        {(categories ?? []).map((c) => (
          <Link key={c.id} href={`/catalog?category=${c.slug}`}>
            <Badge variant={category === c.slug ? "default" : "outline"}>
              {c.name_zh}
            </Badge>
          </Link>
        ))}
      </div>

      {books.length === 0 ? (
        <p className="text-muted-foreground">此分類暫無書籍。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
