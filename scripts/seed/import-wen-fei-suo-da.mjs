/**
 * Imports the real 問非所答 manuscript (8 series / 72 entries) from Keith
 * Lam's Google Drive draft folder, replacing the earlier single-chapter
 * placeholder that was transcribed from a promotional slide photo.
 *
 * Usage: node scripts/seed/import-wen-fei-suo-da.mjs
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

const book = JSON.parse(
  readFileSync(path.join(__dirname, "wen-fei-suo-da-book.json"), "utf-8"),
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  const { data: existingBook, error: findError } = await supabase
    .from("devotional_books")
    .select("id, slug")
    .eq("slug", "da-fei-suo-wen")
    .single();

  if (findError || !existingBook) {
    console.error("Could not find existing 答非所問 placeholder book:", findError);
    process.exit(1);
  }

  const { error: updateError } = await supabase
    .from("devotional_books")
    .update({
      title_zh: book.title_zh,
      title_en: book.title_en,
      author_name: book.author_name,
      declaration_markdown: book.declaration_markdown,
      preface_markdown: book.preface_markdown,
      afterword_markdown: book.afterword_markdown,
      topic_index: book.topic_index,
    })
    .eq("id", existingBook.id);

  if (updateError) throw updateError;
  console.log(`Updated book "${book.title_zh}" (${existingBook.id})`);

  // Remove the old single-chapter placeholder volume (cascades to its entry).
  const { error: deleteError } = await supabase
    .from("devotional_volumes")
    .delete()
    .eq("book_id", existingBook.id);
  if (deleteError) throw deleteError;
  console.log("Removed placeholder volume/entry");

  let totalEntries = 0;
  for (const vol of book.volumes) {
    const { data: volumeRow, error: volError } = await supabase
      .from("devotional_volumes")
      .insert({
        book_id: existingBook.id,
        volume_number: vol.volume_number,
        title_zh: vol.title_zh,
        subtitle_zh: vol.subtitle_zh,
        intro_markdown: vol.intro_markdown,
        sort_order: vol.volume_number,
      })
      .select("id")
      .single();
    if (volError) throw volError;

    const { error: entriesError } = await supabase.from("devotional_entries").insert(
      vol.entries.map((e) => ({
        book_id: existingBook.id,
        volume_id: volumeRow.id,
        entry_number: e.entry_number,
        title: e.title,
        subtitle: e.subtitle,
        body_markdown: e.body_markdown,
        scripture_reference: e.scripture_reference,
        status: "draft",
      })),
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
    "Book and entries are imported as DRAFT — review then publish via /admin/devotionals.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
