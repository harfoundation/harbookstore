import { markdownToXhtmlBody } from "../../src/lib/epub/render-markdown";

export type PdfEntry = {
  entry_number: number;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  scripture_reference: string | null;
  written_date: string | null;
};

export type PdfVolume = {
  volume_number: number;
  title_zh: string;
  subtitle_zh: string | null;
  intro_markdown: string | null;
  entries: PdfEntry[];
};

export type PdfBook = {
  title_zh: string;
  title_en: string | null;
  author_name: string | null;
  author_bio_markdown: string | null;
  declaration_markdown: string | null;
  preface_markdown: string | null;
  afterword_markdown: string | null;
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Builds one long HTML document for the whole book. Pagination is handled
 * entirely by Chromium's print engine via `page-break-after`, so this is a
 * single continuous flow, not pre-paginated — there is no way to know real
 * page numbers ahead of time, which is why the table of contents lists
 * chapter titles only (no page numbers). See generate-devotional-pdf.ts for
 * why this renders through Playwright/Chromium rather than a live endpoint.
 */
export function renderBookHtml(
  book: PdfBook,
  volumes: PdfVolume[],
  mode: "screen" | "print",
): string {
  const bodyFontSize = mode === "screen" ? "13pt" : "10.5pt";
  const lineHeight = mode === "screen" ? 1.7 : 1.55;

  const sections: string[] = [];

  sections.push(
    `<section class="page half-title"><div class="center-wrap"><h1>${escapeHtml(book.title_zh)}</h1></div></section>`,
  );

  sections.push(`<section class="page title-page"><div class="center-wrap">
    <h1>${escapeHtml(book.title_zh)}</h1>
    ${book.title_en ? `<p class="subtitle-en">${escapeHtml(book.title_en)}</p>` : ""}
    ${book.author_name ? `<p class="author">${escapeHtml(book.author_name)}</p>` : ""}
  </div></section>`);

  sections.push(`<section class="page colophon"><div class="bottom-wrap">
    <p>山書房 Har Bookstore</p>
    <p>由 HAR Cultural Foundation Ltd（HAR 文化基金有限公司）出版</p>
    <p>2–6 Oxford Street, (Wesley Uniting Church Box Hill), Box Hill, VIC Australia 3128</p>
  </div></section>`);

  if (book.declaration_markdown) {
    sections.push(
      `<section class="page front-matter">${markdownToXhtmlBody(book.declaration_markdown)}</section>`,
    );
  }
  if (book.preface_markdown) {
    sections.push(
      `<section class="page front-matter"><h2>序言</h2>${markdownToXhtmlBody(book.preface_markdown)}</section>`,
    );
  }
  if (book.author_bio_markdown) {
    sections.push(
      `<section class="page front-matter"><h2>作者簡介</h2>${markdownToXhtmlBody(book.author_bio_markdown)}</section>`,
    );
  }

  const tocItems = volumes
    .flatMap((v) => [
      `<li class="toc-volume">第${v.volume_number}卷　${escapeHtml(v.title_zh)}</li>`,
      ...v.entries.map(
        (e) => `<li class="toc-entry">${e.entry_number}. ${escapeHtml(e.title)}</li>`,
      ),
    ])
    .join("\n");
  sections.push(`<section class="page toc"><h2>目錄</h2><ul>${tocItems}</ul></section>`);

  for (const volume of volumes) {
    sections.push(`<section class="page volume-title"><div class="center-wrap">
      <p class="volume-label">第${volume.volume_number}卷</p>
      <h1>${escapeHtml(volume.title_zh)}</h1>
      ${volume.subtitle_zh ? `<p class="subtitle">${escapeHtml(volume.subtitle_zh)}</p>` : ""}
      ${volume.intro_markdown ? markdownToXhtmlBody(volume.intro_markdown) : ""}
    </div></section>`);

    for (const entry of volume.entries) {
      sections.push(`<section class="page entry">
        <p class="entry-number">第${volume.volume_number}卷 · ${entry.entry_number}</p>
        <h1>${escapeHtml(entry.title)}</h1>
        ${entry.subtitle ? `<p class="subtitle">${escapeHtml(entry.subtitle)}</p>` : ""}
        ${entry.scripture_reference ? `<p class="scripture">${escapeHtml(entry.scripture_reference)}</p>` : ""}
        ${markdownToXhtmlBody(entry.body_markdown)}
      </section>`);
    }
  }

  if (book.afterword_markdown) {
    sections.push(
      `<section class="page front-matter"><h2>後記</h2>${markdownToXhtmlBody(book.afterword_markdown)}</section>`,
    );
  }

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8"/>
<style>
  @page { margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: "Noto Serif CJK TC", "PingFang TC", "PMingLiU", serif; color: #1a1a1a; margin: 0; }
  .page { page-break-after: always; padding: 0.3in; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 20pt; margin: 0 0 0.3em; }
  h2 { font-size: 16pt; margin: 0 0 0.6em; }
  p { font-size: ${bodyFontSize}; line-height: ${lineHeight}; margin: 0 0 0.8em; }
  .center-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 7.4in; }
  .bottom-wrap { display: flex; flex-direction: column; justify-content: flex-end; height: 7.4in; }
  .title-page .subtitle-en { color: #555; font-size: 13pt; }
  .title-page .author { font-size: 13pt; margin-top: 1em; }
  .colophon { font-size: 9pt; color: #666; }
  .toc h2 { text-align: center; }
  .toc ul { list-style: none; padding: 0; }
  .toc-volume { font-weight: bold; margin-top: 1em; }
  .toc-entry { padding-left: 1.2em; font-size: 10.5pt; color: #333; }
  .volume-title .volume-label { color: #888; letter-spacing: 0.1em; }
  .entry .entry-number { color: #888; font-size: 9pt; margin-bottom: 0.5em; }
  .entry .subtitle { color: #9b2c2c; font-weight: bold; }
  .entry .scripture { color: #0f766e; font-size: 10pt; }
</style>
</head>
<body>
${sections.join("\n")}
</body>
</html>`;
}
