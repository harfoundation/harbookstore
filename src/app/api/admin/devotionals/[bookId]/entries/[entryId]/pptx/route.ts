import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/get-current-profile";
import { generateEntryPptx } from "@/lib/pptx/generate-pptx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string; entryId: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  const { bookId, entryId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select("slug, title_zh")
    .eq("id", bookId)
    .single();

  if (!book) {
    return NextResponse.json({ error: "找不到書籍" }, { status: 404 });
  }

  const { data: entry } = await supabase
    .from("devotional_entries")
    .select(
      "entry_number, title, subtitle, body_markdown, scripture_reference, devotional_volumes(volume_number, title_zh)",
    )
    .eq("id", entryId)
    .eq("book_id", bookId)
    .single();

  if (!entry) {
    return NextResponse.json({ error: "找不到篇章" }, { status: 404 });
  }

  const volume = entry.devotional_volumes as unknown as {
    volume_number: number;
    title_zh: string;
  } | null;

  const buffer = await generateEntryPptx(entry, {
    book_title_zh: book.title_zh,
    volume_label: volume ? `第${volume.volume_number}卷　${volume.title_zh}` : null,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${book.slug}-${entry.entry_number}.pptx"`,
      "Cache-Control": "no-store",
    },
  });
}
