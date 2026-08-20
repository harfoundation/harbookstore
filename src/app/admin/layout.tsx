import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { LocaleToggle } from "@/components/locale-toggle";

const ADMIN_NAV = [
  { href: "/admin/churches", label: "堂會服務（多堂會）" },
  { href: "/admin/settlement-resources", label: "移民安家資源" },
  { href: "/admin/events", label: "活動公告" },
  { href: "/admin/check-in", label: "主日人員登記" },
  { href: "/admin/congregations", label: "主日名冊管理" },
  { href: "/admin/books", label: "書籍" },
  { href: "/admin/orders", label: "訂單" },
  { href: "/admin/donations", label: "奉獻管理" },
  { href: "/admin/membership", label: "會員登記管理" },
  { href: "/admin/referrals", label: "會員推薦" },
  { href: "/admin/points", label: "會員點數" },
  { href: "/admin/borrow-requests", label: "借閱申請" },
  { href: "/admin/courses", label: "課程" },
  { href: "/admin/articles", label: "書評文章" },
  { href: "/admin/devotionals", label: "靈修文集" },
  { href: "/admin/reader-questions", label: "人生解惑" },
  { href: "/admin/branches", label: "分店" },
  { href: "/admin/duty-roster", label: "排班表" },
  { href: "/admin/live-translate", label: "即時翻譯" },
  { href: "/admin/bookable-services", label: "可預約服務" },
  { href: "/admin/bookings", label: "預約管理" },
  { href: "/admin/secondhand", label: "二手商品" },
  { href: "/admin/whatsapp-contacts", label: "WhatsApp 聯絡人" },
  { href: "/admin/applications", label: "同工/志工申請" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:gap-8 sm:py-8">
      <aside className="shrink-0 space-y-1 sm:w-48">
        <p className="text-muted-foreground mb-2 hidden text-xs font-semibold tracking-wide uppercase sm:block">
          管理後台
        </p>
        <LocaleToggle />
        <nav className="mt-2 flex gap-1 overflow-x-auto text-sm sm:flex-col sm:overflow-visible">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-muted shrink-0 rounded px-2 py-1.5 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-muted-foreground hover:bg-muted shrink-0 rounded px-2 py-1.5 whitespace-nowrap"
          >
            ← 返回網站
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
