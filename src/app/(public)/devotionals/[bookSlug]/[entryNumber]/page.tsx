import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

const proseClasses =
  "max-w-none space-y-4 text-sm leading-relaxed [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed";

export default async function DevotionalEntryPage({
  params,
}: {
  params: Promise<{ bookSlug: string; entryNumber: string }>;
}) {
  const { bookSlug, entryNumber } = await params;
  const entryNum = Number(entryNumber);
  if (!Number.isInteger(entryNum)) notFound();

  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  const { data: book } = await supabase
    .from("devotional_books")
    .select("id, title_zh, status")
    .eq("slug", bookSlug)
    .single();

  if (!book || (book.status !== "published" && !isStaff)) notFound();

  const { data: entry } = await supabase
    .from("devotional_entries")
    .select(
      "id, entry_number, title, subtitle, body_markdown, scripture_reference, written_date, status, devotional_volumes(volume_number, title_zh)",
    )
    .eq("book_id", book.id)
    .eq("entry_number", entryNum)
    .single();

  if (!entry || (entry.status !== "published" && !isStaff)) notFound();

  const volume = entry.devotional_volumes as unknown as {
    volume_number: number;
    title_zh: string;
  } | null;

  const prevQuery = supabase
    .from("devotional_entries")
    .select("entry_number, title")
    .eq("book_id", book.id)
    .lt("entry_number", entryNum)
    .order("entry_number", { ascending: false })
    .limit(1);
  const nextQuery = supabase
    .from("devotional_entries")
    .select("entry_number, title")
    .eq("book_id", book.id)
    .gt("entry_number", entryNum)
    .order("entry_number", { ascending: true })
    .limit(1);

  const [{ data: prevEntry }, { data: nextEntry }] = await Promise.all([
    (isStaff ? prevQuery : prevQuery.eq("status", "published")).maybeSingle(),
    (isStaff ? nextQuery : nextQuery.eq("status", "published")).maybeSingle(),
  ]);

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      {isStaff && (
        <Link
          href={`/admin/devotionals/${book.id}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← 返回管理後台
        </Link>
      )}

      {(book.status !== "published" || entry.status !== "published") && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          草稿預覽 — 此內容尚未發布，僅管理員可見。
        </div>
      )}

      <header className="space-y-2">
        <Link
          href={`/devotionals/${bookSlug}`}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← {book.title_zh}
        </Link>
        {volume && (
          <Badge variant="outline">
            第{volume.volume_number}卷　{volume.title_zh}
          </Badge>
        )}
        <h1 className="text-2xl font-bold">
          {entry.entry_number}. {entry.title}
        </h1>
        {entry.subtitle && (
          <p className="font-medium text-red-700 dark:text-red-400">{entry.subtitle}</p>
        )}
        {entry.scripture_reference && (
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
            {entry.scripture_reference}
          </p>
        )}
        {entry.written_date && (
          <p className="text-muted-foreground text-sm">
            {new Date(entry.written_date).toLocaleDateString("zh-TW")}
          </p>
        )}
      </header>

      <div className={proseClasses}>
        <ReactMarkdown>{entry.body_markdown}</ReactMarkdown>
      </div>

      <nav className="flex items-center justify-between border-t pt-4 text-sm">
        {prevEntry ? (
          <Link
            href={`/devotionals/${bookSlug}/${prevEntry.entry_number}`}
            className="hover:text-primary underline underline-offset-4"
          >
            ← {prevEntry.entry_number}. {prevEntry.title}
          </Link>
        ) : (
          <span />
        )}
        {nextEntry ? (
          <Link
            href={`/devotionals/${bookSlug}/${nextEntry.entry_number}`}
            className="hover:text-primary text-right underline underline-offset-4"
          >
            {nextEntry.entry_number}. {nextEntry.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
