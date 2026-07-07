import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "管理後台" };

const SECTIONS = [
  { href: "/admin/events", label: "活動公告", description: "發布/編輯活動公告" },
  { href: "/admin/check-in", label: "主日人員登記", description: "主日打卡、新朋友登記" },
  {
    href: "/admin/congregations",
    label: "堂會管理",
    description: "堂會與同工/老朋友名單",
  },
  { href: "/admin/books", label: "書籍", description: "書目管理" },
  { href: "/admin/orders", label: "訂單", description: "訂單與付款確認" },
  { href: "/admin/borrow-requests", label: "借閱申請", description: "免費借閱審核" },
  { href: "/admin/courses", label: "課程", description: "課程與課堂管理" },
  { href: "/admin/articles", label: "書評文章", description: "書評文章 CMS" },
  { href: "/admin/devotionals", label: "靈修文集", description: "靈修書籍與篇章" },
  { href: "/admin/reader-questions", label: "人生解惑", description: "讀者提問回覆" },
  { href: "/admin/branches", label: "分店", description: "分店資料管理" },
  {
    href: "/admin/bookable-services",
    label: "可預約服務",
    description: "Co-op/Cafe 等可預約服務",
  },
  { href: "/admin/bookings", label: "預約管理", description: "預約確認/回覆" },
  { href: "/admin/secondhand", label: "二手商品", description: "二手品選購管理" },
  {
    href: "/admin/whatsapp-contacts",
    label: "WhatsApp 聯絡人",
    description: "聯絡人名單管理",
  },
  { href: "/admin/applications", label: "同工/志工申請", description: "申請審核" },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">管理後台</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{section.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
