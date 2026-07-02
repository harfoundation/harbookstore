import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { PartnerBookDialog } from "@/components/partner/partner-book-dialog";
import { PartnerCourseDialog } from "@/components/partner/partner-course-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "我的提交" };

const APPROVAL_LABEL: Record<string, string> = {
  draft: "草稿",
  pending_review: "待審核",
  approved: "已核准",
  rejected: "已拒絕",
};

export default async function PartnerSubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: books }, { data: courses }] = await Promise.all([
    supabase.from("book_categories").select("id, name_zh").order("sort_order"),
    supabase
      .from("books")
      .select("id, title, approval_status, review_notes, created_at")
      .eq("submitted_by", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, title, approval_status, review_notes")
      .eq("submitted_by", user!.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        <PartnerBookDialog categories={categories ?? []} />
        <PartnerCourseDialog />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">已提交書籍</h2>
        {(books ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未提交任何書籍。</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {(books ?? []).map((b) => (
              <div key={b.id} className="space-y-1 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.title}</p>
                  <Badge
                    variant={b.approval_status === "approved" ? "default" : "secondary"}
                  >
                    {APPROVAL_LABEL[b.approval_status]}
                  </Badge>
                </div>
                {b.review_notes && (
                  <p className="text-muted-foreground text-sm">
                    審核備註：{b.review_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">已提交課程/服務</h2>
        {(courses ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未提交任何課程。</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {(courses ?? []).map((c) => (
              <div key={c.id} className="space-y-1 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.title}</p>
                  <Badge
                    variant={c.approval_status === "approved" ? "default" : "secondary"}
                  >
                    {APPROVAL_LABEL[c.approval_status]}
                  </Badge>
                </div>
                {c.review_notes && (
                  <p className="text-muted-foreground text-sm">
                    審核備註：{c.review_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
