import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DevotionalEntryEditor } from "@/components/admin/devotional-entry-editor";

export const dynamic = "force-dynamic";

export default async function EditDevotionalEntryPage({
  params,
}: {
  params: Promise<{ bookId: string; entryId: string }>;
}) {
  const { bookId, entryId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select("id, title_zh")
    .eq("id", bookId)
    .single();

  if (!book) notFound();

  const [{ data: volumes }, { data: entry }] = await Promise.all([
    supabase
      .from("devotional_volumes")
      .select("id, volume_number, title_zh")
      .eq("book_id", bookId)
      .order("volume_number"),
    supabase
      .from("devotional_entries")
      .select(
        "id, volume_id, entry_number, title, subtitle, body_markdown, scripture_reference, written_date, status",
      )
      .eq("id", entryId)
      .eq("book_id", bookId)
      .single(),
  ]);

  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        {book.title_zh} — 編輯篇章 {entry.entry_number}
      </h1>
      <DevotionalEntryEditor bookId={bookId} volumes={volumes ?? []} entry={entry} />
    </div>
  );
}
