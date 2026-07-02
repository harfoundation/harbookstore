import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CancelBorrowRequestButton } from "@/components/borrow/cancel-borrow-request-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "借閱紀錄" };

const STATUS_LABEL: Record<string, string> = {
  requested: "已申請",
  approved: "已批准",
  picked_up: "已取書",
  returned: "已歸還",
  cancelled: "已取消",
};

export default async function BorrowRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("borrow_requests")
    .select("id, status, delivery_method, requested_at, due_at, books(title, author)")
    .order("requested_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">借閱紀錄</h1>

      {(requests ?? []).length === 0 ? (
        <p className="text-muted-foreground">尚未有任何借閱申請。</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {(requests ?? []).map((req) => {
            const book = req.books as unknown as {
              title: string;
              author: string | null;
            } | null;
            return (
              <div key={req.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{book?.title ?? "（書籍）"}</p>
                  <p className="text-muted-foreground text-xs">
                    申請於 {new Date(req.requested_at).toLocaleDateString("zh-TW")}
                    {req.due_at &&
                      ` · 應歸還 ${new Date(req.due_at).toLocaleDateString("zh-TW")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{STATUS_LABEL[req.status] ?? req.status}</Badge>
                  {req.status === "requested" && (
                    <CancelBorrowRequestButton borrowRequestId={req.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
