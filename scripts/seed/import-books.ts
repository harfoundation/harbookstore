/**
 * Idempotent upsert of the 50-book poster catalog into Supabase.
 * Usage: pnpm db:seed:books  (reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local)
 *
 * Source data (books-50.json) is a best-effort transcription of a printed
 * poster; entries flagged `needs_review: true` have titles/authors that were
 * hard to OCR cleanly and should be checked against real publisher listings
 * before being used for actual procurement/pricing decisions.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

const booksData: Array<{
  poster_number: number;
  category: string;
  title: string;
  author: string | null;
  needs_review: boolean;
}> = JSON.parse(readFileSync(path.join(__dirname, "books-50.json"), "utf-8"));

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

async function main() {
  const { data: categories, error: categoriesError } = await supabase
    .from("book_categories")
    .select("id, slug");

  if (categoriesError) throw categoriesError;

  const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

  let upserted = 0;
  let skipped = 0;

  for (const book of booksData) {
    const categoryId = slugToId.get(book.category);
    if (!categoryId) {
      console.warn(
        `Skipping poster_number=${book.poster_number}: unknown category slug "${book.category}"`,
      );
      skipped++;
      continue;
    }

    const { error } = await supabase.from("books").upsert(
      {
        poster_number: book.poster_number,
        category_id: categoryId,
        title: book.title,
        author: book.author,
        procurement_status: "preorder",
        is_active: true,
      },
      { onConflict: "poster_number" },
    );

    if (error) {
      console.error(
        `Failed to upsert poster_number=${book.poster_number}:`,
        error.message,
      );
      skipped++;
      continue;
    }
    upserted++;
  }

  console.log(`Done. Upserted ${upserted} books, skipped ${skipped}.`);
  const needsReview = booksData.filter((b) => b.needs_review).length;
  if (needsReview > 0) {
    console.log(
      `${needsReview} entries are flagged needs_review — verify title/author/ISBN against publisher listings before enabling retail/procurement for them.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
