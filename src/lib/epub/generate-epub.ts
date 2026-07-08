import JSZip from "jszip";
import { markdownToXhtmlBody, escapeXml } from "./render-markdown";

export type EpubEntry = {
  entry_number: number;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  scripture_reference: string | null;
  written_date: string | null;
};

export type EpubVolume = {
  volume_number: number;
  title_zh: string;
  subtitle_zh: string | null;
  intro_markdown: string | null;
  entries: EpubEntry[];
};

export type EpubBook = {
  id: string;
  title_zh: string;
  title_en: string | null;
  author_name: string | null;
  author_bio_markdown: string | null;
  declaration_markdown: string | null;
  preface_markdown: string | null;
  afterword_markdown: string | null;
};

// No explicit body font-size previously — most e-readers (Apple Books
// included) then fall back to an oversized default reading size, and the
// 1.4em/1.2em headings compounded on top of that. Pinning an explicit,
// modest base size fixes it for every book this generator produces.
const STYLE_CSS = `
html { font-size: 100%; }
body { font-family: serif; font-size: 0.9em; line-height: 1.7; margin: 1.5em; }
p { font-size: 1em; margin: 0.7em 0; }
h1 { font-size: 1.3em; margin: 1em 0 0.5em; }
h2 { font-size: 1.1em; margin: 0.8em 0 0.4em; }
.meta { color: #666; font-size: 0.85em; margin-bottom: 1em; }
.subtitle { color: #a33; font-weight: bold; font-size: 1em; margin-top: -0.5em; }
`;

function xhtmlPage(title: string, bodyHtml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-Hant" xml:lang="zh-Hant">
<head>
<meta charset="UTF-8"/>
<title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

type Doc = {
  id: string;
  filename: string;
  title: string;
  xhtml: string;
  navLabel: string | null;
};

function buildDocs(book: EpubBook, volumes: EpubVolume[]): Doc[] {
  const docs: Doc[] = [];
  let counter = 0;
  const next = () => String(counter++).padStart(3, "0");

  docs.push({
    id: `doc-${next()}`,
    filename: "titlepage.xhtml",
    title: book.title_zh,
    navLabel: book.title_zh,
    xhtml: xhtmlPage(
      book.title_zh,
      `<h1>${escapeXml(book.title_zh)}</h1>` +
        (book.title_en ? `<p class="meta">${escapeXml(book.title_en)}</p>` : "") +
        (book.author_name
          ? `<p class="meta">作者：${escapeXml(book.author_name)}</p>`
          : ""),
    ),
  });

  if (book.declaration_markdown) {
    docs.push({
      id: `doc-${next()}`,
      filename: "declaration.xhtml",
      title: "聲明",
      navLabel: "聲明",
      xhtml: xhtmlPage("聲明", markdownToXhtmlBody(book.declaration_markdown)),
    });
  }

  if (book.preface_markdown) {
    docs.push({
      id: `doc-${next()}`,
      filename: "preface.xhtml",
      title: "序言",
      navLabel: "序言",
      xhtml: xhtmlPage(
        "序言",
        `<h1>序言</h1>${markdownToXhtmlBody(book.preface_markdown)}`,
      ),
    });
  }

  if (book.author_bio_markdown) {
    docs.push({
      id: `doc-${next()}`,
      filename: "author-bio.xhtml",
      title: "作者簡介",
      navLabel: "作者簡介",
      xhtml: xhtmlPage(
        "作者簡介",
        `<h1>作者簡介</h1>${markdownToXhtmlBody(book.author_bio_markdown)}`,
      ),
    });
  }

  for (const volume of volumes) {
    const publishedEntries = [...volume.entries].sort(
      (a, b) => a.entry_number - b.entry_number,
    );
    if (publishedEntries.length === 0) continue;

    const volumeLabel = `第${volume.volume_number}卷　${volume.title_zh}`;

    if (volume.intro_markdown) {
      docs.push({
        id: `doc-${next()}`,
        filename: `volume-${volume.volume_number}-intro.xhtml`,
        title: volumeLabel,
        navLabel: volumeLabel,
        xhtml: xhtmlPage(
          volumeLabel,
          `<h1>${escapeXml(volumeLabel)}</h1>` +
            (volume.subtitle_zh
              ? `<p class="meta">${escapeXml(volume.subtitle_zh)}</p>`
              : "") +
            markdownToXhtmlBody(volume.intro_markdown),
        ),
      });
    }

    for (const entry of publishedEntries) {
      const entryTitle = `${entry.entry_number}. ${entry.title}`;
      docs.push({
        id: `doc-${next()}`,
        filename: `volume-${volume.volume_number}-entry-${entry.entry_number}.xhtml`,
        title: entryTitle,
        navLabel: entryTitle,
        xhtml: xhtmlPage(
          entryTitle,
          `<h1>${escapeXml(entryTitle)}</h1>` +
            (entry.subtitle
              ? `<p class="subtitle">${escapeXml(entry.subtitle)}</p>`
              : "") +
            (entry.scripture_reference
              ? `<p class="meta">${escapeXml(entry.scripture_reference)}</p>`
              : "") +
            markdownToXhtmlBody(entry.body_markdown),
        ),
      });
    }
  }

  if (book.afterword_markdown) {
    docs.push({
      id: `doc-${next()}`,
      filename: "afterword.xhtml",
      title: "後記",
      navLabel: "後記",
      xhtml: xhtmlPage(
        "後記",
        `<h1>後記</h1>${markdownToXhtmlBody(book.afterword_markdown)}`,
      ),
    });
  }

  return docs;
}

export async function generateDevotionalEpub(
  book: EpubBook,
  volumes: EpubVolume[],
): Promise<Buffer> {
  const docs = buildDocs(book, volumes);
  const zip = new JSZip();

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  const oebps = zip.folder("OEBPS")!;
  oebps.file("style.css", STYLE_CSS);
  for (const doc of docs) {
    oebps.file(doc.filename, doc.xhtml);
  }

  const navListItems = docs
    .filter((d) => d.navLabel)
    .map((d) => `<li><a href="${d.filename}">${escapeXml(d.navLabel!)}</a></li>`)
    .join("\n");

  oebps.file(
    "nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-Hant" xml:lang="zh-Hant">
<head><meta charset="UTF-8"/><title>目錄</title></head>
<body>
<nav epub:type="toc" id="toc">
<h1>目錄</h1>
<ol>
${navListItems}
</ol>
</nav>
</body>
</html>`,
  );

  const manifestItems = docs
    .map(
      (d) =>
        `<item id="${d.id}" href="${d.filename}" media-type="application/xhtml+xml"/>`,
    )
    .join("\n");
  const spineItems = docs.map((d) => `<itemref idref="${d.id}"/>`).join("\n");

  oebps.file(
    "content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${book.id}</dc:identifier>
    <dc:title>${escapeXml(book.title_zh)}</dc:title>
    <dc:language>zh-Hant</dc:language>
    ${book.author_name ? `<dc:creator>${escapeXml(book.author_name)}</dc:creator>` : ""}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`,
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return buffer;
}
