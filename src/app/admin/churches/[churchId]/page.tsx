import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChurchServiceFormDialog } from "@/components/admin/church-service-form-dialog";
import { WorshipSongFormDialog } from "@/components/admin/worship-song-form-dialog";
import { ServiceMaterialFormDialog } from "@/components/admin/service-material-form-dialog";
import { ChurchAnnouncementFormDialog } from "@/components/admin/church-announcement-form-dialog";
import { ChurchRegistrationStatusSelect } from "@/components/admin/church-registration-status-select";

export const dynamic = "force-dynamic";

const REGISTRATION_TYPE_LABELS: Record<string, string> = {
  newcomer: "新朋友",
  co_worker: "同工",
};

export default async function AdminChurchDetailPage({
  params,
}: {
  params: Promise<{ churchId: string }>;
}) {
  const { churchId } = await params;
  const supabase = await createClient();

  const { data: church } = await supabase
    .from("churches")
    .select("id, slug, name_zh, name_en")
    .eq("id", churchId)
    .single();

  if (!church) notFound();

  const [
    { data: services },
    { data: songs },
    { data: materials },
    { data: registrations },
    { data: announcements },
    { data: congregations },
  ] = await Promise.all([
    supabase
      .from("church_services")
      .select("id, name_zh, schedule_label, day_of_week, language, description, sort_order, is_active")
      .eq("church_id", churchId)
      .order("sort_order"),
    supabase
      .from("worship_songs")
      .select("id, title, lyrics_markdown, file_url")
      .eq("church_id", churchId)
      .order("title"),
    supabase
      .from("service_materials")
      .select(
        "id, service_id, service_date, sermon_title, sermon_speaker, sermon_ppt_url, notes, status, church_services(name_zh), service_material_songs(worship_song_id)",
      )
      .eq("church_id", churchId)
      .order("service_date", { ascending: false })
      .limit(20),
    supabase
      .from("church_registrations")
      .select("id, registration_type, full_name, phone, email, message, status, created_at")
      .eq("church_id", churchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("church_announcements")
      .select("id, title, body_markdown, status, published_at, created_at")
      .eq("church_id", churchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("congregations")
      .select("id, name")
      .eq("church_id", churchId)
      .order("sort_order"),
  ]);

  const songOptions = (songs ?? []).map((s) => ({ id: s.id, title: s.title }));
  const serviceOptions = (services ?? []).map((s) => ({ id: s.id, name_zh: s.name_zh }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/churches" className="text-muted-foreground text-sm hover:underline">
            ← 返回堂會列表
          </Link>
          <h1 className="text-xl font-bold">{church.name_zh}</h1>
          {church.name_en && <p className="text-muted-foreground text-sm">{church.name_en}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/admin/congregations?church=${church.slug}`} />}
          >
            堂會人員管理
          </Button>
          <Button
            variant="outline"
            render={<Link href={`/admin/check-in?church=${church.slug}`} />}
          >
            主日人員登記
          </Button>
          <Button variant="outline" render={<Link href={`/church/${church.slug}`} />}>
            預覽公開頁面
          </Button>
        </div>
      </div>

      {/* Services -------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">每週聚會</h2>
          <ChurchServiceFormDialog
            churchId={churchId}
            trigger={<Button size="sm">新增聚會</Button>}
          />
        </div>
        {(services ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未設定任何聚會。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>語言</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(services ?? []).map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name_zh}</TableCell>
                  <TableCell>{service.schedule_label}</TableCell>
                  <TableCell>{service.language ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "啟用中" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChurchServiceFormDialog
                      churchId={churchId}
                      service={service}
                      trigger={
                        <Button variant="outline" size="sm">
                          編輯
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Worship songs ----------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">敬拜詩歌</h2>
          <WorshipSongFormDialog
            churchId={churchId}
            trigger={<Button size="sm">新增詩歌</Button>}
          />
        </div>
        {(songs ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未建立任何詩歌。</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(songs ?? []).map((song) => (
              <div key={song.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{song.title}</span>
                <WorshipSongFormDialog
                  churchId={churchId}
                  song={song}
                  trigger={
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Service materials (weekly sermon + songs) ------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">每次聚會資料（講道 PPT ／詩歌單）</h2>
          {serviceOptions.length > 0 && (
            <ServiceMaterialFormDialog
              churchId={churchId}
              services={serviceOptions}
              songs={songOptions}
              trigger={<Button size="sm">新增聚會資料</Button>}
            />
          )}
        </div>
        {(materials ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未上傳任何聚會資料。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>聚會</TableHead>
                <TableHead>講道主題</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(materials ?? []).map((material) => {
                const serviceRel = material.church_services as unknown as {
                  name_zh: string;
                } | null;
                const songIds = (
                  material.service_material_songs as unknown as {
                    worship_song_id: string;
                  }[]
                ).map((s) => s.worship_song_id);
                return (
                  <TableRow key={material.id}>
                    <TableCell>{material.service_date}</TableCell>
                    <TableCell>{serviceRel?.name_zh}</TableCell>
                    <TableCell>{material.sermon_title ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={material.status === "published" ? "default" : "secondary"}>
                        {material.status === "published" ? "已發布" : "草稿"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ServiceMaterialFormDialog
                        churchId={churchId}
                        services={serviceOptions}
                        songs={songOptions}
                        material={{ ...material, songIds }}
                        trigger={
                          <Button variant="outline" size="sm">
                            編輯
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Registrations ------------------------------------------------------ */}
      <section className="space-y-3">
        <h2 className="font-semibold">新朋友／同工報名</h2>
        {(registrations ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚無報名紀錄。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>類型</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>聯絡方式</TableHead>
                <TableHead>留言</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(registrations ?? []).map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <Badge variant="outline">{REGISTRATION_TYPE_LABELS[reg.registration_type]}</Badge>
                  </TableCell>
                  <TableCell>{reg.full_name}</TableCell>
                  <TableCell className="text-sm">
                    {reg.phone && <div>{reg.phone}</div>}
                    {reg.email && <div>{reg.email}</div>}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm">{reg.message ?? "—"}</TableCell>
                  <TableCell>
                    <ChurchRegistrationStatusSelect registrationId={reg.id} status={reg.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Announcements ------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">通知</h2>
          <ChurchAnnouncementFormDialog
            churchId={churchId}
            trigger={<Button size="sm">新增通知</Button>}
          />
        </div>
        {(announcements ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">尚未發布任何通知。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>標題</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(announcements ?? []).map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>
                    <Badge variant={announcement.status === "published" ? "default" : "secondary"}>
                      {announcement.status === "published" ? "已發布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChurchAnnouncementFormDialog
                      churchId={churchId}
                      announcement={announcement}
                      trigger={
                        <Button variant="outline" size="sm">
                          編輯
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {(congregations ?? []).length === 0 && (
        <p className="text-muted-foreground text-sm">
          尚未設定堂會人員名單，前往「堂會人員管理」新增。
        </p>
      )}
    </div>
  );
}
