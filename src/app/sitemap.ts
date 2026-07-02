import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [{ data: books }, { data: categories }, { data: articles }, { data: courses }] =
    await Promise.all([
      supabase.from("books").select("id").eq("is_active", true),
      supabase.from("book_categories").select("slug"),
      supabase.from("articles").select("slug").eq("status", "published"),
      supabase.from("courses").select("id").eq("is_published", true),
    ]);

  const staticRoutes = ["", "/catalog", "/courses", "/articles", "/ask", "/lending"].map(
    (route) => ({ url: `${siteUrl}${route}` }),
  );

  return [
    ...staticRoutes,
    ...(books ?? []).map((b) => ({ url: `${siteUrl}/catalog/${b.id}` })),
    ...(categories ?? []).map((c) => ({ url: `${siteUrl}/categories/${c.slug}` })),
    ...(articles ?? []).map((a) => ({ url: `${siteUrl}/articles/${a.slug}` })),
    ...(courses ?? []).map((c) => ({ url: `${siteUrl}/courses/${c.id}` })),
  ];
}
