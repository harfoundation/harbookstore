import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SpeakerPanel } from "@/components/admin/speaker-panel";
import { languageLabel } from "@/lib/translation/languages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "即時翻譯控制台" };

export default async function AdminLiveTranslateSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("translation_sessions")
    .select("id, title, source_lang, target_lang, status")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{session.title}</h1>
        <p className="text-muted-foreground text-sm">
          {languageLabel(session.source_lang)} → {languageLabel(session.target_lang)}
          {session.status === "ended" && "（已結束）"}
        </p>
      </div>

      {session.status === "active" ? (
        <SpeakerPanel
          sessionId={session.id}
          sourceLang={session.source_lang}
          targetLang={session.target_lang}
        />
      ) : (
        <p className="text-muted-foreground">此場次已結束，無法繼續收音。</p>
      )}
    </div>
  );
}
