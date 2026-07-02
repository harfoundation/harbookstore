import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GiftForm } from "@/components/catalog/gift-form";

export const dynamic = "force-dynamic";

export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string }>;
}) {
  const { bookId } = await searchParams;

  if (!bookId) {
    return (
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">贈書</h1>
        <p className="text-muted-foreground">
          請先在{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            書目
          </Link>{" "}
          中選擇一本書，再點選「作為禮物贈送」。
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("id, title, price_cents")
    .eq("id", bookId)
    .single();

  if (!book) {
    return <p className="text-muted-foreground text-center">找不到這本書。</p>;
  }

  return <GiftForm book={book} />;
}
