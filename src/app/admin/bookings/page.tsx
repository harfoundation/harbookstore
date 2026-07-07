import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ServiceBookingRespondForm } from "@/components/admin/service-booking-respond-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "預約管理" };

const STATUS_LABEL: Record<string, string> = {
  pending: "待處理",
  confirmed: "已確認",
  declined: "無法安排",
  cancelled: "已取消",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("service_bookings")
    .select(
      "id, customer_name, customer_email, customer_phone, party_size, preferred_date, preferred_time, notes, status, admin_reply_message, created_at, bookable_services(name)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">預約管理</h1>

      <div className="space-y-4">
        {(bookings ?? []).map((booking) => {
          const service = booking.bookable_services as unknown as { name: string } | null;
          return (
            <div key={booking.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{service?.name ?? "預約項目"}</p>
                <Badge variant={booking.status === "pending" ? "default" : "secondary"}>
                  {STATUS_LABEL[booking.status]}
                </Badge>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>
                  {booking.customer_name}　{booking.customer_email}
                  {booking.customer_phone ? `　${booking.customer_phone}` : ""}
                </p>
                <p>
                  希望日期：{booking.preferred_date}
                  {booking.preferred_time ? `　時段：${booking.preferred_time}` : ""}
                  {booking.party_size ? `　人數：${booking.party_size}` : ""}
                </p>
                {booking.notes && <p>備註：{booking.notes}</p>}
                <p className="text-xs">
                  提交時間：{new Date(booking.created_at).toLocaleString("zh-TW")}
                </p>
              </div>
              {booking.status === "pending" ? (
                <ServiceBookingRespondForm bookingId={booking.id} />
              ) : (
                booking.admin_reply_message && (
                  <p className="text-sm">回覆內容：{booking.admin_reply_message}</p>
                )
              )}
            </div>
          );
        })}
        {(bookings ?? []).length === 0 && (
          <p className="text-muted-foreground">目前沒有預約。</p>
        )}
      </div>
    </div>
  );
}
