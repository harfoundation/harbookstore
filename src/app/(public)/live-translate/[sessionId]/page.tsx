import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { ListenerView } from "@/components/live-translate/listener-view";
import { languageLabel } from "@/lib/translation/languages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "即時翻譯" };

export default async function LiveTranslateListenerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/live-translate/${sessionId}`);

  const supabase = await createClient();
  const [{ data: session }, { data: captions }] = await Promise.all([
    supabase
      .from("translation_sessions")
      .select("id, title, source_lang, target_lang, status")
      .eq("id", sessionId)
      .single(),
    supabase
      .from("translation_captions")
      .select("id, source_text, translated_text, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  if (!session) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {languageLabel(session.source_lang)} → {languageLabel(session.target_lang)}
        </p>
      </div>

      <ListenerView
        sessionId={session.id}
        targetLang={session.target_lang}
        initialCaptions={captions ?? []}
        sessionActive={session.status === "active"}
      />
    </div>
  );
}
