import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { hasTutorAccess } from "@/lib/actions/ai-tutor";
import { isTutorLive } from "@/lib/ai-tutor/demo";
import { TutorChat, type TutorChatMessage } from "@/components/ai-tutor/tutor-chat";
import type { TutorSource } from "@/lib/ai-tutor/tutor";

export const dynamic = "force-dynamic";
// askTutor runs as a Server Action on this route; a multi-search answer can take a minute.
export const maxDuration = 300;
export const metadata: Metadata = { title: "HAR AI 神學導師" };

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/tutor");

  if (!(await hasTutorAccess())) {
    return (
      <div className="mx-auto max-w-2xl space-y-2">
        <h1 className="text-2xl font-bold">HAR AI 神學導師</h1>
        <p className="text-muted-foreground">
          HAR AI 神學導師目前在試點階段，只開放給受邀學員。如想參加，請聯絡授課牧師。
        </p>
      </div>
    );
  }

  const { c: conversationId } = await searchParams;
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("ai_tutor_conversations")
    .select("id, title, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const active = conversationId
    ? conversations?.find((c) => c.id === conversationId)
    : undefined;

  let initialMessages: TutorChatMessage[] = [];
  if (active) {
    const { data: rows } = await supabase
      .from("ai_tutor_messages")
      .select("id, role, content, sources, review_status, reviewer_note")
      .eq("conversation_id", active.id)
      .order("created_at");
    initialMessages = (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as TutorChatMessage["role"],
      content: r.content,
      sources: (r.sources as TutorSource[] | null) ?? [],
      reviewStatus: r.review_status as TutorChatMessage["reviewStatus"],
      reviewerNote: r.reviewer_note,
    }));
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
      <aside className="shrink-0 space-y-2 md:w-56">
        <Link
          href="/tutor"
          className="hover:bg-muted block rounded border px-3 py-2 text-sm font-medium"
        >
          ＋ 新的提問
        </Link>
        <nav className="flex gap-1 overflow-x-auto text-sm md:flex-col md:overflow-visible">
          {(conversations ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/tutor?c=${c.id}`}
              className={`hover:bg-muted shrink-0 truncate rounded px-2 py-1.5 md:shrink ${
                c.id === active?.id ? "bg-muted font-medium" : ""
              }`}
            >
              {c.title}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">HAR AI 神學導師</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            以聖經和 HAR
            神學文獻庫為根據回答，並註明出處。找不到資料時會直接說明，不會編造引文。
          </p>
        </div>
        <TutorChat
          key={active?.id ?? "new"}
          conversationId={active?.id}
          initialMessages={initialMessages}
          demo={!isTutorLive()}
        />
      </div>
    </div>
  );
}
