"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HarBookstoreLogo } from "@/components/har-bookstore-logo";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LocaleToggle } from "@/components/locale-toggle";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/events", label: "活動公告" },
  { href: "/catalog", label: "書目" },
  { href: "/courses", label: "課程" },
  { href: "/articles", label: "書評" },
  { href: "/devotionals", label: "靈修文集" },
  { href: "/ask", label: "人生解惑" },
  { href: "/lending", label: "借閱" },
  { href: "/secondhand", label: "二手品" },
  { href: "/bookings", label: "線下預約" },
  { href: "/branches", label: "分店" },
  { href: "/join", label: "加入我們" },
];

export function SiteHeader({
  user,
  isStaff,
  isPartner,
}: {
  user: { id: string; email?: string; displayName: string | null } | null;
  isStaff: boolean;
  isPartner?: boolean;
}) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`登出失敗：${error.message}`);
      return;
    }
    toast.success("已登出");
    // Hard navigation instead of router.refresh(): guarantees the next
    // request re-evaluates auth cookies fresh rather than relying on the
    // RSC cache picking up the just-cleared session.
    window.location.href = "/";
  }

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <HarBookstoreLogo className="text-foreground h-7 w-7" />
          <span className="text-lg font-bold whitespace-nowrap">
            山書房{" "}
            <span className="text-muted-foreground hidden text-sm font-normal sm:inline">
              Har Bookstore
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleToggle />
          <Button render={<Link href="/cart" />} variant="ghost" size="sm">
            購物車{itemCount > 0 ? ` (${itemCount})` : ""}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                {user.displayName ?? user.email ?? "我的帳戶"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href="/profile" />}>
                  個人資料
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  我的訂單
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/borrow-requests" />}>
                  借閱紀錄
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/course-progress" />}>
                  學習進度
                </DropdownMenuItem>
                {isPartner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/partner/submissions" />}>
                      合作夥伴中心
                    </DropdownMenuItem>
                  </>
                )}
                {isStaff && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      管理後台
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>登出</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button render={<Link href="/login" />} size="sm">
              登入 / 註冊
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
