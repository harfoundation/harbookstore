import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { WriteReviewPageContent } from "@/components/articles/write-review-page-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "書評寫作邀請" };

export default async function BookReviewWritePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("id, title")
    .eq("is_active", true)
    .order("poster_number");

  return (
    <div className="mx-auto max-w-2xl">
      <WriteReviewPageContent
        isLoggedIn={!!profile}
        books={books ?? []}
        defaultName={profile?.displayName ?? ""}
        defaultEmail={profile?.email ?? ""}
      />
    </div>
  );
}
