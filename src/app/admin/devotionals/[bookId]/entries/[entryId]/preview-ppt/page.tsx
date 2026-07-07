import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildSlideModel, SLIDE_COLORS } from "@/lib/pptx/slide-model";

export const dynamic = "force-dynamic";

// 10in x 5.63in slide, rendered at 72px/inch so point-based font sizes map
// directly to pixel font sizes (1pt = 1/72in = 1px at this scale).
const SLIDE_WIDTH = 720;
const SLIDE_HEIGHT = 405.36;
const inX = (inches: number) => `${(inches / 10) * 100}%`;
const inY = (inches: number) => `${(inches / 5.63) * 100}%`;

export default async function PreviewPptPage({
  params,
}: {
  params: Promise<{ bookId: string; entryId: string }>;
}) {
  const { bookId, entryId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("devotional_books")
    .select("id, title_zh")
    .eq("id", bookId)
    .single();
  if (!book) notFound();

  const { data: entry } = await supabase
    .from("devotional_entries")
    .select(
      "entry_number, title, subtitle, body_markdown, scripture_reference, devotional_volumes(volume_number, title_zh)",
    )
    .eq("id", entryId)
    .eq("book_id", bookId)
    .single();
  if (!entry) notFound();

  const volume = entry.devotional_volumes as unknown as {
    volume_number: number;
    title_zh: string;
  } | null;

  const model = buildSlideModel(entry, {
    book_title_zh: book.title_zh,
    volume_label: volume ? `第${volume.volume_number}卷　${volume.title_zh}` : null,
  });

  const totalSlides = model.contentChunks.length + 1;
  // Rough overflow heuristic mirroring the actual PPT's char budget, so the
  // preview can flag slides likely to need PowerPoint's auto-shrink.
  const OVERFLOW_WARNING_CHARS = 300;

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/devotionals/${bookId}`}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← 返回書籍
      </Link>

      <div>
        <h1 className="text-xl font-bold">
          PPT 預覽：{entry.entry_number}. {entry.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          共 {totalSlides} 張投影片 — 此預覽以與實際匯出相同的排版邏輯產生，僅供排版檢查，
          非最終渲染畫面（實際 PowerPoint/Keynote 開啟後字體與自動縮放可能略有差異）。
        </p>
      </div>

      <div className="space-y-6">
        {/* Title slide */}
        <div
          className="relative mx-auto overflow-hidden rounded-lg border shadow-sm"
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            maxWidth: "100%",
            backgroundColor: SLIDE_COLORS.background,
          }}
        >
          <div
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: "42%",
              aspectRatio: "1",
              right: "-10%",
              left: "auto",
              top: "60%",
              background: SLIDE_COLORS.accentSoft,
              opacity: 0.6,
            }}
          />
          <div
            className="absolute top-0 left-0 h-full"
            style={{ width: inX(0.15), background: SLIDE_COLORS.accentBar }}
          />
          <div
            className="absolute"
            style={{
              left: inX(0.7),
              top: inY(0.6),
              width: inX(8.6),
              color: SLIDE_COLORS.overline,
              fontSize: 14,
            }}
          >
            {model.overline}
          </div>
          <div
            className="absolute font-bold"
            style={{
              left: inX(0.7),
              top: inY(1.4),
              width: inX(8.6),
              color: SLIDE_COLORS.title,
              fontSize: 32,
              lineHeight: 1.2,
            }}
          >
            {model.titleText}
          </div>
          {model.subtitle && (
            <div
              className="absolute font-bold"
              style={{
                left: inX(0.7),
                top: inY(3.1),
                width: inX(8.6),
                color: SLIDE_COLORS.subtitle,
                fontSize: 20,
              }}
            >
              {model.subtitle}
            </div>
          )}
          {model.scriptureReference && (
            <div
              className="absolute"
              style={{
                left: inX(0.7),
                top: inY(4.6),
                width: inX(8.6),
                color: SLIDE_COLORS.scripture,
                fontSize: 16,
              }}
            >
              {model.scriptureReference}
            </div>
          )}
          <div className="absolute right-2 bottom-1 text-xs text-neutral-400">
            1 / {totalSlides}
          </div>
        </div>

        {/* Content slides */}
        {model.contentChunks.map((chunk, index) => {
          const likelyOverflow = chunk.length > OVERFLOW_WARNING_CHARS;
          return (
            <div
              key={index}
              className="relative mx-auto overflow-hidden rounded-lg border bg-white shadow-sm"
              style={{
                width: SLIDE_WIDTH,
                height: SLIDE_HEIGHT,
                maxWidth: "100%",
                borderColor: likelyOverflow ? "#DC2626" : undefined,
                borderWidth: likelyOverflow ? 2 : undefined,
              }}
            >
              <div
                className="absolute top-0 left-0 rounded-full"
                style={{
                  width: "42%",
                  aspectRatio: "1",
                  right: "-10%",
                  left: "auto",
                  top: "60%",
                  background: SLIDE_COLORS.accentSoft,
                  opacity: 0.6,
                }}
              />
              <div
                className="absolute top-0 left-0 w-full"
                style={{ height: inY(0.08), background: SLIDE_COLORS.accentBar }}
              />
              <div
                className="absolute"
                style={{
                  left: inX(0.6),
                  top: inY(0.3),
                  width: inX(8.8),
                  color: SLIDE_COLORS.overline,
                  fontSize: 12,
                }}
              >
                {model.titleText}
              </div>
              <div
                className="absolute overflow-hidden whitespace-pre-line"
                style={{
                  left: inX(0.6),
                  top: inY(0.9),
                  width: inX(8.8),
                  height: inY(4.3),
                  color: SLIDE_COLORS.body,
                  fontSize: 16,
                  lineHeight: 1.3,
                }}
              >
                {chunk}
              </div>
              <div className="absolute right-2 bottom-1 text-xs text-neutral-400">
                {index + 2} / {totalSlides}
              </div>
              {likelyOverflow && (
                <div className="absolute top-1 right-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  可能溢出
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
