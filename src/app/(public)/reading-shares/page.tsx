import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { ReadingShareForm } from "@/components/reading-shares/reading-share-form";
import { ReadingShareCard } from "@/components/reading-shares/reading-share-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "讀書分享" };

export default async function ReadingSharesPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const { book: bookFilter } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  const { data: books } = await supabase
    .from("books")
    .select("id, title")
    .eq("is_active", true)
    .order("poster_number");

  let query = supabase
    .from("reading_shares")
    .select("id, shared_by_name, source_group, quote_text, is_hidden, created_at, books(title)")
    .order("created_at", { ascending: false });

  if (bookFilter) query = query.eq("book_id", bookFilter);

  const { data: shares } = await query;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">讀書分享</h1>
        <p className="text-muted-foreground text-sm">
          把 WhatsApp 群組／社群裡值得留住的分享錄入這裡，結構化保存、不再錯過。
        </p>
      </div>

      {profile ? (
        <ReadingShareForm books={books ?? []} defaultBookId={bookFilter} />
      ) : (
        <p className="text-muted-foreground rounded-lg border p-4 text-sm">
          登入後即可錄入分享。
        </p>
      )}

      <div className="space-y-3">
        {(shares ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚無分享紀錄。</p>
        ) : (
          (shares ?? []).map((share) => {
            const bookRel = share.books as unknown as { title: string } | null;
            return (
              <ReadingShareCard
                key={share.id}
                share={{ ...share, book_title: bookRel?.title ?? "" }}
                showModeration={isStaff}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
