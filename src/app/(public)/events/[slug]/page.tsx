import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const proseClasses =
  "max-w-none space-y-4 text-sm leading-relaxed [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "title, description, body_markdown, event_date, event_time, location, poster_image_url, status",
    )
    .eq("slug", slug)
    .single();

  if (!event || event.status !== "published") notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      {event.poster_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.poster_image_url}
          alt={event.title}
          className="w-full rounded-lg object-cover"
        />
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground text-sm">
          {event.event_date}
          {event.event_time ? `　${event.event_time}` : ""}
        </p>
        {event.location && (
          <p className="text-muted-foreground text-sm">{event.location}</p>
        )}
        {event.description && <p className="text-sm">{event.description}</p>}
      </header>

      {event.body_markdown && (
        <div className={proseClasses}>
          <ReactMarkdown>{event.body_markdown}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
