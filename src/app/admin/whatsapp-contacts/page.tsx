import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsappContactDialog } from "@/components/admin/whatsapp-contact-dialog";
import { WhatsappCsvImportDialog } from "@/components/admin/whatsapp-csv-import-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "WhatsApp 聯絡人" };

const SOURCE_LABEL: Record<string, string> = {
  manual: "手動新增",
  csv_import: "CSV 匯入",
  platform_signup: "平台註冊",
};

export default async function AdminWhatsappContactsPage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("whatsapp_contacts")
    .select("id, phone_number, display_name, tags, opt_in, source, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">WhatsApp 聯絡人</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            目前僅作聯絡人名單管理，尚未串接 WhatsApp Business
            官方訊息發送（需要您提供商業帳號後再開通群發功能）。
          </p>
        </div>
        <div className="flex gap-2">
          <WhatsappContactDialog />
          <WhatsappCsvImportDialog />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>電話</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>來源</TableHead>
            <TableHead>已同意通知</TableHead>
            <TableHead>標籤</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(contacts ?? []).map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.phone_number}</TableCell>
              <TableCell>{c.display_name ?? "—"}</TableCell>
              <TableCell>{SOURCE_LABEL[c.source] ?? c.source}</TableCell>
              <TableCell>
                <Badge variant={c.opt_in ? "default" : "secondary"}>
                  {c.opt_in ? "已同意" : "未同意"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {(c.tags ?? []).join(", ") || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
