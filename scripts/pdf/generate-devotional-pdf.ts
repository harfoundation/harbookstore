/**
 * Renders a devotional book to two PDF variants: a screen-friendly e-book
 * PDF and a print-ready PDF sized for physical book production (6x9in trade
 * paperback trim, generous margins, running page-number footer).
 *
 * This is a local/CI script, not a live API route. Headless Chromium is a
 * large, memory-hungry binary that Vercel's serverless functions can't run
 * reliably on the free tier (cold starts, size limits) — the same reason
 * Playwright e2e tests only run in CI/local, never in production. Run this
 * with Supabase running locally (or pointed at a real project via env vars),
 * then find the PDFs in dist/pdf/.
 *
 * Usage: pnpm pdf:devotional <book-slug>
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBookHtml, type PdfVolume } from "./render-book-html";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../.env.local") });

const bookSlug = process.argv[2];
if (!bookSlug) {
  console.error("Usage: pnpm pdf:devotional <book-slug>");
  process.exit(1);
}

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
  const { data: book, error: bookError } = await supabase
    .from("devotional_books")
    .select(
      "id, slug, title_zh, title_en, author_name, author_bio_markdown, declaration_markdown, preface_markdown, afterword_markdown",
    )
    .eq("slug", bookSlug)
    .single();

  if (bookError || !book) {
    console.error(`Book not found for slug "${bookSlug}"`);
    process.exit(1);
  }

  const { data: volumes } = await supabase
    .from("devotional_volumes")
    .select(
      "volume_number, title_zh, subtitle_zh, intro_markdown, devotional_entries(entry_number, title, subtitle, body_markdown, scripture_reference, written_date, status)",
    )
    .eq("book_id", book.id)
    .order("volume_number");

  const publishedVolumes: PdfVolume[] = (volumes ?? [])
    .map((v) => ({
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
      )
        .filter((e) => e.status === "published")
        .sort((a, b) => a.entry_number - b.entry_number),
    }))
    .filter((v) => v.entries.length > 0);

  const totalEntries = publishedVolumes.reduce((n, v) => n + v.entries.length, 0);
  if (totalEntries === 0) {
    console.warn(
      "Warning: no published entries found — the PDF will only contain front/back matter. Publish entries via /admin/devotionals first.",
    );
  }

  const outDir = path.join(__dirname, "../../dist/pdf");
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const mode of ["screen", "print"] as const) {
      const html = renderBookHtml(book, publishedVolumes, mode);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });

      const outPath = path.join(outDir, `${book.slug}-${mode}.pdf`);
      await page.pdf({
        path: outPath,
        width: "6in",
        height: "9in",
        margin:
          mode === "print"
            ? { top: "0.75in", bottom: "0.75in", left: "0.7in", right: "0.6in" }
            : { top: "0.6in", bottom: "0.6in", left: "0.55in", right: "0.55in" },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div></div>`,
        footerTemplate: `<div style="width:100%;font-size:8px;text-align:center;color:#888;font-family:serif;"><span class="pageNumber"></span></div>`,
      });
      console.log(`Wrote ${outPath} (${totalEntries} entries, ${mode} layout)`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
