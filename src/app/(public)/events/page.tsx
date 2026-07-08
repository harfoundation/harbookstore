import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "活動公告" };

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select(
      "id, slug, title, description, event_date, event_time, location, poster_image_url",
    )
    .eq("status", "published")
    .order("event_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">活動公告</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          山書坊與 Har Foundation 近期活動。
        </p>
      </div>

      {(events ?? []).length === 0 ? (
        <p className="text-muted-foreground">目前暫無活動公告。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(events ?? []).map((event) => (
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
                  {event.description && (
                    <p className="line-clamp-2 text-sm">{event.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
