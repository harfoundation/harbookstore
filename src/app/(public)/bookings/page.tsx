import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { ServiceBookingForm } from "@/components/bookings/service-booking-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "線下預約" };

const CATEGORY_LABELS: Record<string, string> = {
  cafe_coop: "Co-op / Cafe",
  consultation: "諮詢／面談",
  venue_hire: "場地租借",
  other: "其他",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const [profile, { data: services }] = await Promise.all([
    getCurrentProfile(),
    supabase
      .from("bookable_services")
      .select("id, name, description, category, branches(suburb)")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">線下預約</h1>
        <p className="text-muted-foreground mt-1">
          預約 Co-op 共享工作空間、Cafe 座位，或其他線下服務。送出後我們會以電郵確認。
        </p>
      </div>

      {(services ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無開放預約的服務。</p>
      ) : (
        <div className="space-y-6">
          {(services ?? []).map((service) => {
            const branch = service.branches as unknown as { suburb: string } | null;
            return (
              <div key={service.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{service.name}</h2>
                  <Badge variant="outline">{CATEGORY_LABELS[service.category]}</Badge>
                  {branch && <Badge variant="secondary">{branch.suburb}</Badge>}
                </div>
                {service.description && (
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                )}
                <ServiceBookingForm
                  serviceId={service.id}
                  defaultName={profile?.displayName ?? undefined}
                  defaultEmail={profile?.email}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
