/**
 * Idempotent import of one text into the AI 神學導師 library
 * (theology_sources + theology_chunks). Re-running replaces the source with
 * the same title.
 *
 * ONLY public-domain, licensed or self-authored teaching texts. Sensitive
 * pastoral material stays on the internal laptop — never import it here.
 *
 * JSON shape:
 *   {
 *     "title": "和合本", "author": null,
 *     "kind": "bible" | "book" | "lecture",
 *     "license": "public_domain" | "licensed" | "own_work", "license_note": "...",
 *     "language": "zh",
 *     "verses":   [{ "book": "約翰福音", "chapter": 3, "verse": 16, "text": "..." }],  // kind=bible
 *     "sections": [{ "ref_label": "卷一 第一章", "content": "..." }]                    // book/lecture
 *   }
 *
 * Usage: pnpm db:seed:theology -- scripts/seed/theology/cuv-sample.json
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

type SourceJson = {
  title: string;
  author?: string | null;
  kind: "bible" | "book" | "lecture";
  license: "public_domain" | "licensed" | "own_work";
  license_note?: string | null;
  language?: string;
  verses?: Array<{ book: string; chapter: number; verse: number; text: string }>;
  sections?: Array<{ ref_label: string; content: string }>;
};

// Long sections are split on paragraph boundaries so each retrieved chunk
// stays small enough to quote; pieces keep the section's ref_label.
const MAX_CHUNK_CHARS = 900;

function splitSection(content: string): string[] {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current}\n\n${p}` : p;
  }
  if (current) chunks.push(current);
  return chunks;
}

// 和合本 prints a full-width space before 神 (the 「神」版 honorific gap);
// drop it so keyword search for e.g. 「神的義」 matches.
const normalizeVerse = (text: string) => text.replace(/　(?=神)/g, "").trim();

const jsonPath = process.argv.slice(2).find((arg) => arg !== "--");
if (!jsonPath) {
  console.error("Usage: pnpm db:seed:theology -- <path-to-source.json>");
  process.exit(1);
}

const src: SourceJson = JSON.parse(readFileSync(jsonPath, "utf8"));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

type ChunkRow = {
  ordinal: number;
  ref_label: string;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  content: string;
};

const rows: ChunkRow[] =
  src.kind === "bible"
    ? (src.verses ?? []).map((v, i) => ({
        ordinal: i,
        ref_label: `${v.book} ${v.chapter}:${v.verse}`,
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        content: normalizeVerse(v.text),
      }))
    : (src.sections ?? [])
        .flatMap((s) =>
          splitSection(s.content).map((content) => ({ ref_label: s.ref_label, content })),
        )
        .map((c, i) => ({ ordinal: i, book: null, chapter: null, verse: null, ...c }));

if (rows.length === 0) {
  console.error("No verses/sections found in", jsonPath);
  process.exit(1);
}

async function main() {
  await supabase.from("theology_sources").delete().eq("title", src.title);

  const { data: source, error: sourceError } = await supabase
    .from("theology_sources")
    .insert({
      title: src.title,
      author: src.author ?? null,
      kind: src.kind,
      license: src.license,
      license_note: src.license_note ?? null,
      language: src.language ?? "zh",
    })
    .select("id")
    .single();
  if (sourceError || !source) throw sourceError ?? new Error("source insert failed");

  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase
      .from("theology_chunks")
      .insert(rows.slice(i, i + BATCH).map((r) => ({ ...r, source_id: source.id })));
    if (error) throw error;
  }

  console.log(`Imported 「${src.title}」: ${rows.length} chunks`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
