import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { generateDevotionalEpub, type EpubVolume } from "@/lib/epub/generate-epub";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  const { bookId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select(
      "id, slug, title_zh, title_en, author_name, author_bio_markdown, declaration_markdown, preface_markdown, afterword_markdown",
    )
    .eq("id", bookId)
    .single();

  if (!book) {
    return NextResponse.json({ error: "找不到書籍" }, { status: 404 });
  }

  const { data: volumes } = await supabase
    .from("devotional_volumes")
    .select(
      "volume_number, title_zh, subtitle_zh, intro_markdown, devotional_entries(entry_number, title, subtitle, body_markdown, scripture_reference, written_date, status)",
    )
    .eq("book_id", bookId)
    .order("volume_number");

  const epubVolumes: EpubVolume[] = (volumes ?? []).map((v) => ({
    volume_number: v.volume_number,
    title_zh: v.title_zh,
    subtitle_zh: v.subtitle_zh,
    intro_markdown: v.intro_markdown,
    entries: (
      v.devotional_entries as unknown as {
        entry_number: number;
        title: string;
        subtitle: string | null;
        body_markdown: string;
        scripture_reference: string | null;
        written_date: string | null;
        status: string;
      }[]
    ).filter((e) => e.status === "published"),
  }));

  const buffer = await generateDevotionalEpub(book, epubVolumes);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/epub+zip",
      "Content-Disposition": `attachment; filename="${book.slug}.epub"`,
      "Cache-Control": "no-store",
    },
  });
}
