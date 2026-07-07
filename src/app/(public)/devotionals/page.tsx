import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "靈修文集" };

export default async function DevotionalsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  const query = supabase
    .from("devotional_books")
    .select("id, slug, title_zh, title_en, subtitle, author_name, status")
    .order("created_at");
  const { data: books } = isStaff ? await query : await query.eq("status", "published");

  return (
    <div className="space-y-6">
      {isStaff && (
        <Link
          href="/admin/devotionals"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← 返回管理後台
        </Link>
      )}

      <div>
        <h1 className="text-2xl font-bold">靈修文集</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          牧者與同工的靈修寫作，按寫作先後順序編排。
        </p>
      </div>

      {(books ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無已發布的文集。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(books ?? []).map((book) => (
            <Link key={book.id} href={`/devotionals/${book.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{book.title_zh}</CardTitle>
                    {book.status !== "published" && (
                      <Badge variant="secondary">草稿</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {book.title_en && (
                    <p className="text-muted-foreground text-sm">{book.title_en}</p>
                  )}
                  {book.author_name && (
                    <p className="text-sm">作者：{book.author_name}</p>
                  )}
                  {book.subtitle && <p className="text-sm">{book.subtitle}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
