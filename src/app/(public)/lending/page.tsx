import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { BorrowRequestButton } from "@/components/catalog/borrow-request-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "免費借書" };

export default async function LendingPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, poster_number")
    .eq("is_lendable", true)
    .eq("is_active", true)
    .order("poster_number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">免費借書</h1>
        <p className="text-muted-foreground mt-1">
          選擇一本書，送出借閱申請，我們會儘快處理。
        </p>
      </div>

      {(books ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無可借閱的書籍。</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {(books ?? []).map((book) => (
            <div key={book.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{book.title}</p>
                {book.author && (
                  <p className="text-muted-foreground text-sm">{book.author}</p>
                )}
              </div>
              <BorrowRequestButton bookId={book.id} isLoggedIn={!!profile} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
