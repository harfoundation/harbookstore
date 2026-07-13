import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { BorrowRequestButton } from "@/components/catalog/borrow-request-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "免費借書" };

export default async function LendingPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  const [{ data: books }, membershipResult] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, poster_number")
      .eq("is_lendable", true)
      .eq("is_active", true)
      .order("poster_number"),
    profile
      ? supabase
          .from("membership_registrations")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("status", "confirmed")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const isMember = isStaff || !!membershipResult.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">免費借書</h1>
        <p className="text-muted-foreground mt-1">
          選擇一本書，送出借閱申請，我們會儘快處理。
        </p>
      </div>

      {profile && !isMember && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <p className="text-sm">
            免費借閱是<span className="font-medium">已繳費會員</span>的專屬福利，登記成為會員即可使用。
          </p>
          <Button size="sm" render={<Link href="/membership" />}>
            前往會員登記
          </Button>
        </div>
      )}

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
              <BorrowRequestButton
                bookId={book.id}
                isLoggedIn={!!profile}
                isMember={isMember}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
