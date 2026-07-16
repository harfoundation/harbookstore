import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { ReferMemberButton } from "@/components/refer-member-button";
import { JoinWhatsappCommunityButton } from "@/components/join-whatsapp-community-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [{ data: categories }, { data: upcomingEvents }] = await Promise.all([
    supabase
      .from("book_categories")
      .select("id, slug, name_zh, subtitle_zh")
      .order("sort_order"),
    supabase
      .from("events")
      .select("id, slug, title, event_date, event_time, location, poster_image_url")
      .eq("status", "published")
      .gte("event_date", todayIso)
      .order("event_date", { ascending: true })
      .limit(3),
  ]);

  return (
    <div className="space-y-12">
      <section className="space-y-6 py-8 text-center sm:py-12">
        {isStaff && (
          <div className="flex justify-center">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
            >
              前往管理後台 →
            </Link>
          </div>
        )}
        <h1
          className="notranslate text-5xl font-extrabold tracking-tight sm:text-6xl"
          translate="no"
        >
          山書坊 <span className="font-poppins">Har Book Club</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-balance text-lg">
          陪你回到耶穌，建立根基——培訓課程、書評專欄、團購贈書與免費借閱，
          一個以人為本的基督教書籍事工。
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button render={<Link href="/catalog" />} size="lg">
            瀏覽書目
          </Button>
          <Button render={<Link href="/lending" />} size="lg" variant="outline">
            免費借書
          </Button>
          <JoinWhatsappCommunityButton variant="outline" className="text-base" />
        </div>
        {profile && (
          <div className="flex justify-center pt-1">
            <ReferMemberButton isLoggedIn={!!profile} />
          </div>
        )}
      </section>

      {(upcomingEvents ?? []).length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">近期活動</h2>
            <Link
              href="/events"
              className="text-primary text-sm underline underline-offset-4"
            >
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(upcomingEvents ?? []).map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  {event.poster_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.poster_image_url}
                      alt={event.title}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {event.event_date}
                      {event.event_time ? `　${event.event_time}` : ""}
                    </p>
                    {event.location && (
                      <p className="text-muted-foreground text-sm">{event.location}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">閱讀路徑推薦</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name_zh}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{category.subtitle_zh}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
