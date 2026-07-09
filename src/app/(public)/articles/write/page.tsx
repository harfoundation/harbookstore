import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Button } from "@/components/ui/button";
import { BookReviewWriterForm } from "@/components/articles/book-review-writer-form";

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
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/articles" className="text-muted-foreground text-sm hover:underline">
          ← 書評
        </Link>
        <h1 className="mt-1 text-2xl font-bold">
          山書坊邀請｜中文屬靈書籍書評寫作
        </h1>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>閱讀，不只是為了增加知識，更是為了讓生命被塑造。</p>

        <p>
          山書坊誠意邀請喜愛閱讀、願意思考、樂於分享的弟兄姊妹，參與
          <strong>「中文屬靈書籍書評寫作」</strong>。
        </p>

        <p>透過閱讀與書評，我們盼望：</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>培養教會閱讀屬靈書籍的文化；</li>
          <li>分享閱讀所得，彼此建立生命；</li>
          <li>推廣優質中文屬靈出版，讓更多人受益；</li>
          <li>建立一個彼此交流、共同成長的閱讀群體。</li>
        </ul>

        <p>
          無論您是第一次嘗試寫書評，還是已有寫作經驗，都非常歡迎參與。我們將提供適當的交流、分享及寫作指引，讓大家一起學習、一起成長。
        </p>

        <p>山書坊書評委員會已正式成立，將配合推動這項事工，主要負責：</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>提供書評寫作訓練，幫助參與者掌握書評寫作的基本技巧；</li>
          <li>為投稿書評提供編輯及修改建議，提升書評的內容、結構及表達；</li>
          <li>審閱所有投稿作品，並決定書評是否採納及安排發表。</li>
        </ul>

        <p>
          我們盼望透過書評委員會的服事，培育更多樂於閱讀、善於思考、勇於分享的基督徒作者，讓優質的屬靈閱讀資源成為眾教會的祝福。
        </p>

        <p>誠邀您加入我們，一起閱讀、思考、書寫，讓一本好書成為更多人的祝福。</p>

        <p className="text-muted-foreground">
          如有興趣參與，歡迎與山書坊聯絡，或報名加入「中文屬靈書籍書評寫作」。
        </p>
      </div>

      {profile ? (
        <BookReviewWriterForm
          books={books ?? []}
          defaultName={profile.displayName ?? ""}
          defaultEmail={profile.email ?? ""}
        />
      ) : (
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <p className="font-medium">請先註冊或登入帳號</p>
          <p className="text-muted-foreground text-sm">
            這樣書評委員會日後才能透過您的帳號與您聯繫、追蹤投稿進度。
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Button render={<Link href="/signup?next=/articles/write" />}>立即註冊</Button>
            <Button variant="outline" render={<Link href="/login?next=/articles/write" />}>
              登入
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
