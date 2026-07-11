import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { WishlistButton } from "@/components/catalog/wishlist-button";
import { BorrowRequestButton } from "@/components/catalog/borrow-request-button";
import { GroupBuyWidget } from "@/components/catalog/group-buy-widget";
import { ReadingShareCard } from "@/components/reading-shares/reading-share-card";
import { isStaffRole } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  available: "現貨",
  preorder: "預購中",
  out_of_stock: "缺貨",
  discontinued: "已下架",
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: book }, { data: groupBuy }, wishlistResult, { data: shares }] =
    await Promise.all([
      supabase
        .from("books")
        .select(
          "id, title, author, translator, description, price_cents, group_buy_price_cents, group_buy_min_qty, procurement_status, is_lendable, cover_image_url, category_id, book_categories(slug, name_zh)",
        )
        .eq("id", bookId)
        .single(),
      supabase
        .from("group_buys")
        .select("id, current_qty, target_qty, status")
        .eq("book_id", bookId)
        .eq("status", "open")
        .maybeSingle(),
      profile
        ? supabase
            .from("wishlists")
            .select("book_id")
            .eq("profile_id", profile.id)
            .eq("book_id", bookId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("reading_shares")
        .select("id, shared_by_name, source_group, quote_text, is_hidden, created_at")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (!book) notFound();

  const category = book.book_categories as unknown as {
    slug: string;
    name_zh: string;
  } | null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="bg-muted flex aspect-[3/4] items-center justify-center rounded-lg">
        <span className="text-muted-foreground text-sm">尚無封面圖片</span>
      </div>

      <div className="space-y-4">
        {category && (
          <Link href={`/categories/${category.slug}`}>
            <Badge variant="outline">{category.name_zh}</Badge>
          </Link>
        )}
        <h1 className="text-2xl font-bold">{book.title}</h1>
        {book.author && <p className="text-muted-foreground">作者：{book.author}</p>}
        {book.translator && (
          <p className="text-muted-foreground">譯者：{book.translator}</p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold">
            {book.price_cents != null
              ? `零售 AUD $${(book.price_cents / 100).toFixed(2)}`
              : "價格待定"}
          </span>
          <Badge
            variant={book.procurement_status === "available" ? "default" : "secondary"}
          >
            {STATUS_LABEL[book.procurement_status] ?? book.procurement_status}
          </Badge>
        </div>

        {book.group_buy_price_cents != null && (
          <p className="text-muted-foreground text-sm">
            團購價 AUD ${(book.group_buy_price_cents / 100).toFixed(2)}
            {book.group_buy_min_qty != null && `（滿 ${book.group_buy_min_qty} 件成團）`}
          </p>
        )}

        {book.description && (
          <p className="text-sm leading-relaxed">{book.description}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <AddToCartButton book={book} />
          <WishlistButton
            bookId={book.id}
            initialInWishlist={!!wishlistResult.data}
            isLoggedIn={!!profile}
          />
          {book.is_lendable && (
            <BorrowRequestButton bookId={book.id} isLoggedIn={!!profile} />
          )}
          <Button render={<Link href={`/gift?bookId=${book.id}`} />} variant="outline">
            作為禮物贈送
          </Button>
        </div>

        {groupBuy && (
          <GroupBuyWidget groupBuy={groupBuy} bookId={book.id} isLoggedIn={!!profile} />
        )}
      </div>

      {(shares ?? []).length > 0 && (
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">讀者分享</h2>
            <Link
              href={`/reading-shares?book=${book.id}`}
              className="text-muted-foreground text-sm hover:underline"
            >
              查看全部／錄入分享 →
            </Link>
          </div>
          {(shares ?? []).map((share) => (
            <ReadingShareCard
              key={share.id}
              share={{ ...share, book_title: book.title }}
              showModeration={isStaffRole(profile?.role)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
