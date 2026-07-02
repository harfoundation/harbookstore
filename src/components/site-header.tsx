"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/catalog", label: "書目" },
  { href: "/courses", label: "課程" },
  { href: "/articles", label: "書評" },
  { href: "/ask", label: "人生解惑" },
  { href: "/lending", label: "借閱" },
];

export function SiteHeader({
  user,
  isStaff,
}: {
  user: { id: string; email?: string; displayName: string | null } | null;
  isStaff: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("已登出");
    router.refresh();
  }

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold whitespace-nowrap">
          山書房{" "}
          <span className="text-muted-foreground text-sm font-normal">Har Bookstore</span>
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
                {isStaff && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      管理後台
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>登出</DropdownMenuItem>
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
