import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateTranslationSessionForm } from "@/components/admin/create-translation-session-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { languageLabel } from "@/lib/translation/languages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "即時翻譯" };

export default async function AdminLiveTranslatePage() {
  const supabase = await createClient();
  const [{ data: sessions }, { data: branches }] = await Promise.all([
    supabase
      .from("translation_sessions")
      .select("id, title, source_lang, target_lang, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("branches").select("id, suburb").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">即時翻譯</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          主日查經現場語音即時翻譯：講者開啟場次後，聽眾用手機打開對應連結即可看字幕、聽翻譯語音。
        </p>
      </div>

      <CreateTranslationSessionForm branches={branches ?? []} />

      <div className="divide-y rounded-lg border">
        {(sessions ?? []).length === 0 && (
          <p className="text-muted-foreground p-4 text-sm">尚無場次紀錄。</p>
        )}
        {(sessions ?? []).map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">
                {s.title}{" "}
                <Badge variant={s.status === "active" ? "default" : "secondary"}>
                  {s.status === "active" ? "進行中" : "已結束"}
                </Badge>
              </p>
              <p className="text-muted-foreground text-sm">
                {languageLabel(s.source_lang)} → {languageLabel(s.target_lang)}
              </p>
            </div>
            <div className="flex gap-2">
              {s.status === "active" && (
                <Button size="sm" render={<Link href={`/admin/live-translate/${s.id}`} />}>
                  控制台
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/live-translate/${s.id}`} />}
              >
                聽眾畫面
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
