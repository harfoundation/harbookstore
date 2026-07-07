import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

const proseClasses =
  "max-w-none space-y-4 text-sm leading-relaxed [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed";

export default async function DevotionalBookPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  const { data: book } = await supabase
    .from("devotional_books")
    .select(
      "id, title_zh, title_en, subtitle, author_name, author_bio_markdown, declaration_markdown, preface_markdown, topic_index, status",
    )
    .eq("slug", bookSlug)
    .single();

  if (!book || (book.status !== "published" && !isStaff)) notFound();

  const otherBooksQuery = book.author_name
    ? supabase
        .from("devotional_books")
        .select("id, slug, title_zh, title_en")
        .eq("author_name", book.author_name)
        .neq("id", book.id)
    : null;
  const { data: otherBooksByAuthor } = otherBooksQuery
    ? isStaff
      ? await otherBooksQuery
      : await otherBooksQuery.eq("status", "published")
    : { data: null };

  const { data: volumes } = await supabase
    .from("devotional_volumes")
    .select(
      "id, volume_number, title_zh, subtitle_zh, intro_markdown, devotional_entries(entry_number, title, status)",
    )
    .eq("book_id", book.id)
    .order("volume_number");

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      {isStaff && (
        <Link
          href={`/admin/devotionals/${book.id}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← 返回管理後台
        </Link>
      )}

      {book.status !== "published" && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          草稿預覽 — 此書尚未發布，僅管理員可見。
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{book.title_zh}</h1>
        {book.title_en && <p className="text-muted-foreground">{book.title_en}</p>}
        {book.author_name && <p className="text-sm">作者：{book.author_name}</p>}
        {book.subtitle && <p className="text-sm">{book.subtitle}</p>}
      </header>

      {otherBooksByAuthor && otherBooksByAuthor.length > 0 && (
        <div className="bg-muted/50 rounded-lg border p-4 text-sm">
          <p className="mb-1 font-medium">{book.author_name} 的其他著作</p>
          <ul className="space-y-1">
            {otherBooksByAuthor.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/devotionals/${other.slug}`}
                  className="hover:text-primary underline underline-offset-4"
                >
                  {other.title_zh}
                  {other.title_en ? `　${other.title_en}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {book.topic_index.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {book.topic_index.map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {book.declaration_markdown && (
        <section className={proseClasses}>
          <ReactMarkdown>{book.declaration_markdown}</ReactMarkdown>
        </section>
      )}

      {book.preface_markdown && (
        <section className={proseClasses}>
          <h2 className="text-lg font-semibold">序言</h2>
          <ReactMarkdown>{book.preface_markdown}</ReactMarkdown>
        </section>
      )}

      {book.author_bio_markdown && (
        <section className={proseClasses}>
          <h2 className="text-lg font-semibold">作者簡介</h2>
          <ReactMarkdown>{book.author_bio_markdown}</ReactMarkdown>
        </section>
      )}

      <section className="space-y-6">
        {(volumes ?? []).map((volume) => {
          const entries = (
            volume.devotional_entries as unknown as {
              entry_number: number;
              title: string;
              status: string;
            }[]
          )
            .filter((e) => e.status === "published" || isStaff)
            .sort((a, b) => a.entry_number - b.entry_number);

          if (entries.length === 0) return null;

          return (
            <div key={volume.id} className="space-y-2">
              <h2 className="text-lg font-semibold">
                第{volume.volume_number}卷　{volume.title_zh}
              </h2>
              {volume.subtitle_zh && (
                <p className="text-muted-foreground text-sm">{volume.subtitle_zh}</p>
              )}
              <ol className="space-y-1 text-sm">
                {entries.map((entry) => (
                  <li key={entry.entry_number}>
                    <Link
                      href={`/devotionals/${bookSlug}/${entry.entry_number}`}
                      className="hover:text-primary underline underline-offset-4"
                    >
                      {entry.entry_number}. {entry.title}
                    </Link>
                    {entry.status !== "published" && (
                      <Badge variant="secondary" className="ml-1.5">
                        草稿
                      </Badge>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>
    </article>
  );
}
