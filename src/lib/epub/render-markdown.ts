import { marked } from "marked";

export function markdownToXhtmlBody(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  // marked emits HTML5 void elements (<br>, <hr>, <img ...>) without a
  // self-closing slash, which is invalid XHTML and breaks EPUB readers.
  return html
    .replace(/<br\s*>/g, "<br/>")
    .replace(/<hr\s*>/g, "<hr/>")
    .replace(/<img ([^>]*[^/])>/g, "<img $1/>");
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
