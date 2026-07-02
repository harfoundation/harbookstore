import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

const ADMIN_NAV = [
  { href: "/admin/books", label: "書籍" },
  { href: "/admin/orders", label: "訂單" },
  { href: "/admin/borrow-requests", label: "借閱申請" },
  { href: "/admin/courses", label: "課程" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0 space-y-1">
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          管理後台
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-muted rounded px-2 py-1.5"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-muted-foreground hover:bg-muted rounded px-2 py-1.5"
          >
            ← 返回網站
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
