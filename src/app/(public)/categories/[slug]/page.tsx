import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/catalog/book-card";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("book_categories")
    .select("id, name_zh, subtitle_zh")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, price_cents, group_buy_price_cents, procurement_status, poster_number")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("poster_number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{category.name_zh}</h1>
        <p className="text-muted-foreground mt-1">{category.subtitle_zh}</p>
      </div>

      {(books ?? []).length === 0 ? (
        <p className="text-muted-foreground">此書單暫無書籍。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(books ?? []).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
