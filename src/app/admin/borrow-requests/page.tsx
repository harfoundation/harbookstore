import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BorrowRequestStatusSelect } from "@/components/admin/borrow-request-status-select";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理借閱申請" };

export default async function AdminBorrowRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("borrow_requests")
    .select(
      "id, status, delivery_method, requested_at, books(title), profiles(display_name)",
    )
    .order("requested_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">借閱申請管理</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>書籍</TableHead>
            <TableHead>借閱人</TableHead>
            <TableHead>領取方式</TableHead>
            <TableHead>申請時間</TableHead>
            <TableHead>狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(requests ?? []).map((req) => {
            const book = req.books as unknown as { title: string } | null;
            const requester = req.profiles as unknown as {
              display_name: string | null;
            } | null;
            return (
              <TableRow key={req.id}>
                <TableCell>{book?.title ?? "—"}</TableCell>
                <TableCell>{requester?.display_name ?? "—"}</TableCell>
                <TableCell>{req.delivery_method === "mail" ? "郵寄" : "自取"}</TableCell>
                <TableCell>
                  {new Date(req.requested_at).toLocaleDateString("zh-TW")}
                </TableCell>
                <TableCell>
                  <BorrowRequestStatusSelect
                    borrowRequestId={req.id}
                    status={req.status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
