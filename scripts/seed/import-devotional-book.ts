/**
 * Idempotent import of a devotional book (volumes + numbered entries) from
 * a structured JSON file into Supabase. Currently used for 傳道心聲/Pastoral
 * Voice (by Keith Lam), parsed from the author's original .docx manuscript.
 *
 * Usage: pnpm db:seed:devotional -- scripts/seed/pastoral-voice-book.json
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

type BookJson = {
  title_zh: string;
  title_en: string | null;
  author_name: string | null;
  declaration_markdown: string | null;
  preface_markdown: string | null;
  afterword_markdown: string | null;
  author_bio_markdown: string | null;
  topic_index: string[];
  volumes: Array<{
    volume_number: number;
    title_zh: string;
    subtitle_zh: string | null;
    intro_markdown: string | null;
    entries: Array<{ entry_number: number; title: string; body_markdown: string }>;
  }>;
};

const jsonPath = process.argv.slice(2).find((arg) => arg !== "--");
if (!jsonPath) {
  console.error("Usage: pnpm db:seed:devotional -- <path-to-book.json>");
  process.exit(1);
}

const book: BookJson = JSON.parse(readFileSync(path.resolve(jsonPath), "utf-8"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(title: string) {
  // Titles here are Chinese, so we can't derive a nice ASCII slug from the
  // text itself — fall back to a stable transliteration-free identifier.
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const slug = slugify(book.title_en || book.title_zh);

  const { data: existingBook } = await supabase
    .from("devotional_books")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const bookRow = {
    slug,
    title_zh: book.title_zh,
    title_en: book.title_en,
    author_name: book.author_name,
    author_bio_markdown: book.author_bio_markdown,
    declaration_markdown: book.declaration_markdown,
    preface_markdown: book.preface_markdown,
    afterword_markdown: book.afterword_markdown,
    topic_index: book.topic_index,
    status: "draft" as const,
  };

  let bookId: string;
  if (existingBook) {
    bookId = existingBook.id;
    const { error } = await supabase
      .from("devotional_books")
      .update(bookRow)
      .eq("id", bookId);
    if (error) throw error;
    console.log(`Updated existing book "${book.title_zh}" (${bookId})`);
  } else {
    const { data, error } = await supabase
      .from("devotional_books")
      .insert(bookRow)
      .select("id")
      .single();
    if (error) throw error;
    bookId = data.id;
    console.log(`Created book "${book.title_zh}" (${bookId})`);
  }

  let totalEntries = 0;
  for (const vol of book.volumes) {
    const { data: existingVol } = await supabase
      .from("devotional_volumes")
      .select("id")
      .eq("book_id", bookId)
      .eq("volume_number", vol.volume_number)
      .maybeSingle();

    const volRow = {
      book_id: bookId,
      volume_number: vol.volume_number,
      title_zh: vol.title_zh,
      subtitle_zh: vol.subtitle_zh,
      intro_markdown: vol.intro_markdown,
      sort_order: vol.volume_number,
    };

    let volumeId: string;
    if (existingVol) {
      volumeId = existingVol.id;
      const { error } = await supabase
        .from("devotional_volumes")
        .update(volRow)
        .eq("id", volumeId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("devotional_volumes")
        .insert(volRow)
        .select("id")
        .single();
      if (error) throw error;
      volumeId = data.id;
    }

    const { error: entriesError } = await supabase.from("devotional_entries").upsert(
      vol.entries.map((e) => ({
        book_id: bookId,
        volume_id: volumeId,
        entry_number: e.entry_number,
        title: e.title,
        body_markdown: e.body_markdown,
        status: "draft" as const,
      })),
      { onConflict: "book_id,entry_number" },
    );
    if (entriesError) throw entriesError;

    totalEntries += vol.entries.length;
    console.log(
      `  Volume ${vol.volume_number} "${vol.title_zh}": ${vol.entries.length} entries`,
    );
  }

  console.log(
    `Done. Imported ${book.volumes.length} volumes, ${totalEntries} entries total.`,
  );
  console.log(
    `Book and entries are imported as DRAFT — review then publish via /admin/devotionals.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
