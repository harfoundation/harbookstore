/**
 * Pure slide-content model shared between the real .pptx generator and the
 * in-browser preview page, so the preview always reflects exactly what a
 * downloaded deck will contain (same colors, same slide-splitting logic).
 */

export const SLIDE_COLORS = {
  background: "#FAFAF7",
  overline: "#6B7280",
  title: "#1C1C1E",
  subtitle: "#9B2C2C",
  scripture: "#0F766E",
  body: "#27272A",
  accentBar: "#1C1C1E",
  accentSoft: "#E7E4DC",
};

// Budget is deliberately conservative: dialogue-heavy entries have many
// short paragraphs, and each paragraph's spacing costs vertical space
// independent of its character count, so a flat char count alone
// underestimates height for that style of text.
const CHARS_PER_CONTENT_SLIDE = 260;
const PARAGRAPH_OVERHEAD_CHARS = 20;

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .trim();
}

export function splitIntoSlideChunks(bodyMarkdown: string): string[] {
  const paragraphs = stripMarkdown(bodyMarkdown)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current: string[] = [];
  let currentWeight = 0;

  for (const paragraph of paragraphs) {
    const weight = paragraph.length + PARAGRAPH_OVERHEAD_CHARS;
    if (currentWeight > 0 && currentWeight + weight > CHARS_PER_CONTENT_SLIDE) {
      chunks.push(current.join("\n\n"));
      current = [];
      currentWeight = 0;
    }
    current.push(paragraph);
    currentWeight += weight;
  }
  if (current.length > 0) chunks.push(current.join("\n\n"));

  return chunks.length > 0 ? chunks : [""];
}

export type SlideModelEntry = {
  entry_number: number;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  scripture_reference: string | null;
};

export type SlideModelContext = {
  book_title_zh: string;
  volume_label: string | null;
};

export type SlideModel = {
  overline: string;
  titleText: string;
  subtitle: string | null;
  scriptureReference: string | null;
  contentChunks: string[];
};

export function buildSlideModel(
  entry: SlideModelEntry,
  ctx: SlideModelContext,
): SlideModel {
  return {
    overline: [ctx.book_title_zh, ctx.volume_label].filter(Boolean).join("　"),
    titleText: `${entry.entry_number}. ${entry.title}`,
    subtitle: entry.subtitle,
    scriptureReference: entry.scripture_reference,
    contentChunks: splitIntoSlideChunks(entry.body_markdown),
  };
}
