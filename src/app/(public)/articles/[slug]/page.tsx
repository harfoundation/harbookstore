import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select(
      "id, title, body_markdown, published_at, status, books(id, title), book_categories(slug, name_zh)",
    )
    .eq("slug", slug)
    .single();

  if (!article || article.status !== "published") notFound();

  const relatedBook = article.books as unknown as { id: string; title: string } | null;
  const relatedCategory = article.book_categories as unknown as {
    slug: string;
    name_zh: string;
  } | null;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        {relatedCategory && (
          <Link href={`/categories/${relatedCategory.slug}`}>
            <Badge variant="outline">{relatedCategory.name_zh}</Badge>
          </Link>
        )}
        <h1 className="text-2xl font-bold">{article.title}</h1>
        {article.published_at && (
          <p className="text-muted-foreground text-sm">
            {new Date(article.published_at).toLocaleDateString("zh-TW")}
          </p>
        )}
      </header>

      <div className="max-w-none space-y-4 text-sm leading-relaxed [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed">
        <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
      </div>

      {relatedBook && (
        <Link
          href={`/catalog/${relatedBook.id}`}
          className="text-primary block underline underline-offset-4"
        >
          查看相關書籍：{relatedBook.title}
        </Link>
      )}
    </article>
  );
}
