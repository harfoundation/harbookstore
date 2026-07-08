import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

const proseClasses =
  "max-w-none space-y-2 text-sm leading-relaxed [&_a]:underline [&_p]:leading-relaxed";

export default async function ChurchHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isStaff = isStaffRole(profile?.role);

  // public_church_directory is a view exposing only safe (non-billing,
  // non-contact) columns for active churches, readable by anon — the
  // underlying churches table itself is staff-only via RLS. Staff fall back
  // to the full table so they can preview an inactive/draft church.
  const { data: publicChurch } = await supabase
    .from("public_church_directory")
    .select("id, slug, name_zh, name_en")
    .eq("slug", slug)
    .maybeSingle();

  const rawChurch = publicChurch
    ? { ...publicChurch, is_active: true }
    : isStaff
      ? (
          await supabase
            .from("churches")
            .select("id, slug, name_zh, name_en, is_active")
            .eq("slug", slug)
            .maybeSingle()
        ).data
      : null;

  // id/slug/name_zh are NOT NULL on the underlying table; the view's
  // generated type just doesn't carry that through.
  if (!rawChurch || !rawChurch.id || !rawChurch.slug || !rawChurch.name_zh) notFound();
  const church = rawChurch as typeof rawChurch & { id: string; slug: string; name_zh: string };

  const [{ data: services }, materialsQuery, announcementsQuery] = await Promise.all([
    supabase
      .from("church_services")
      .select("id, name_zh, schedule_label, language, description")
      .eq("church_id", church.id)
      .eq("is_active", true)
      .order("sort_order"),
    (async () => {
      let query = supabase
        .from("service_materials")
        .select(
          "id, service_date, sermon_title, sermon_speaker, sermon_ppt_url, status, church_services(name_zh), service_material_songs(worship_songs(id, title))",
        )
        .eq("church_id", church.id)
        .order("service_date", { ascending: false })
        .limit(8);
      if (!isStaff) query = query.eq("status", "published");
      return query;
    })(),
    (async () => {
      let query = supabase
        .from("church_announcements")
        .select("id, title, body_markdown, status, published_at")
        .eq("church_id", church.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!isStaff) query = query.eq("status", "published");
      return query;
    })(),
  ]);

  const materials = materialsQuery.data ?? [];
  const announcements = announcementsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {isStaff && (
        <Link
          href={`/admin/churches/${church.id}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← 返回管理後台
        </Link>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{church.name_zh}</h1>
        {church.name_en && <p className="text-muted-foreground">{church.name_en}</p>}
        <Button size="sm" render={<Link href={`/church/${church.slug}/register`} />}>
          新朋友／同工登記
        </Button>
      </header>

      {announcements.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">通知</h2>
          {announcements.map((a) => (
            <div key={a.id} className="rounded-lg border p-4">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-medium">{a.title}</h3>
                {a.status !== "published" && <Badge variant="secondary">草稿預覽</Badge>}
              </div>
              <div className={proseClasses}>
                <ReactMarkdown>{a.body_markdown}</ReactMarkdown>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">每週聚會</h2>
        {services && services.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {services.map((s) => (
              <div key={s.id} className="space-y-0.5 p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{s.name_zh}</h3>
                  {s.language && <Badge variant="outline">{s.language}</Badge>}
                </div>
                <p className="text-muted-foreground text-sm">{s.schedule_label}</p>
                {s.description && <p className="text-sm">{s.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">尚未公布聚會時間。</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">最新講道與敬拜詩歌</h2>
        {materials.length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未上傳任何資料。</p>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => {
              const serviceRel = m.church_services as unknown as { name_zh: string } | null;
              const songs = (
                m.service_material_songs as unknown as {
                  worship_songs: { id: string; title: string } | null;
                }[]
              )
                .map((s) => s.worship_songs)
                .filter((s): s is { id: string; title: string } => s !== null);

              return (
                <div key={m.id} className="rounded-lg border p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      {m.service_date}　{serviceRel?.name_zh}
                    </p>
                    {m.status !== "published" && <Badge variant="secondary">草稿預覽</Badge>}
                  </div>
                  {m.sermon_title && (
                    <h3 className="font-medium">
                      {m.sermon_title}
                      {m.sermon_speaker && (
                        <span className="text-muted-foreground font-normal">
                          　{m.sermon_speaker}
                        </span>
                      )}
                    </h3>
                  )}
                  {m.sermon_ppt_url && (
                    <a
                      href={m.sermon_ppt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      下載講道 PPT
                    </a>
                  )}
                  {songs.length > 0 && (
                    <p className="mt-1 text-sm">
                      敬拜詩歌：{songs.map((s) => s.title).join("、")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
