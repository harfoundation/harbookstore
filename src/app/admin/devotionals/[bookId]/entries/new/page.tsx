import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DevotionalEntryEditor } from "@/components/admin/devotional-entry-editor";

export const dynamic = "force-dynamic";

export default async function NewDevotionalEntryPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select("id, title_zh")
    .eq("id", bookId)
    .single();

  if (!book) notFound();

  const { data: volumes } = await supabase
    .from("devotional_volumes")
    .select("id, volume_number, title_zh")
    .eq("book_id", bookId)
    .order("volume_number");

  const { data: maxEntry } = await supabase
    .from("devotional_entries")
    .select("entry_number")
    .eq("book_id", bookId)
    .order("entry_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{book.title_zh} — 新增篇章</h1>
      <DevotionalEntryEditor
        bookId={bookId}
        volumes={volumes ?? []}
        nextEntryNumber={(maxEntry?.entry_number ?? 0) + 1}
      />
    </div>
  );
}
