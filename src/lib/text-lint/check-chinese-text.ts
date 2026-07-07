/**
 * Lightweight, rule-based proofreading pass for Chinese devotional text.
 * This is NOT a grammar/spell checker — it flags mechanical issues that are
 * cheap to detect reliably without NLP: punctuation width/doubling, stray
 * ASCII quotes where the corpus otherwise uses 「」, and doubled function
 * words that are almost always typos. False negatives are expected; the
 * goal is to catch the common slips, not replace human proofreading.
 */

export type LintIssue = {
  type: "punctuation" | "duplicate-punctuation" | "quotes" | "duplicate-word" | "spacing";
  message: string;
  excerpt: string;
  index: number;
};

const CJK = "\\u4e00-\\u9fff\\u3400-\\u4dbf";

const HALF_TO_FULL_PUNCT: Record<string, string> = {
  ",": "，",
  ".": "。",
  "!": "！",
  "?": "？",
  ";": "；",
  ":": "：",
};

const DUPLICATE_WORD_CANDIDATES = [
  "的",
  "地",
  "得",
  "了",
  "是",
  "在",
  "和",
  "與",
  "也",
  "都",
  "就",
];

function excerptAround(text: string, index: number, radius = 12): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end).replace(/\n/g, " ") + suffix;
}

export function checkChineseText(text: string): LintIssue[] {
  const issues: LintIssue[] = [];

  // Half-width punctuation directly adjacent to CJK text.
  const halfWidthRe = new RegExp(`([${CJK}])([,.!?;:])|([,.!?;:])([${CJK}])`, "g");
  for (const match of text.matchAll(halfWidthRe)) {
    const punct = match[2] ?? match[3];
    const index = match.index ?? 0;
    issues.push({
      type: "punctuation",
      message: `建議將半形「${punct}」改為全形「${HALF_TO_FULL_PUNCT[punct] ?? punct}」`,
      excerpt: excerptAround(text, index),
      index,
    });
  }

  // Doubled punctuation (full-width or half-width), e.g. "，，" "。。" "！！".
  const dupPunctRe = /([，。！？、；：,.!?;:])\1+/g;
  for (const match of text.matchAll(dupPunctRe)) {
    const index = match.index ?? 0;
    issues.push({
      type: "duplicate-punctuation",
      message: `重複的標點符號「${match[0]}」`,
      excerpt: excerptAround(text, index),
      index,
    });
  }

  // Straight ASCII quotes where the corpus convention uses 「」/『』.
  const straightQuoteRe = /["']/g;
  for (const match of text.matchAll(straightQuoteRe)) {
    const index = match.index ?? 0;
    issues.push({
      type: "quotes",
      message: `偵測到直角引號「${match[0]}」，建議改用「」或『』`,
      excerpt: excerptAround(text, index),
      index,
    });
  }

  // Doubled single-character function words, e.g. "的的" — almost always a typo.
  for (const word of DUPLICATE_WORD_CANDIDATES) {
    const dupWordRe = new RegExp(`${word}${word}`, "g");
    for (const match of text.matchAll(dupWordRe)) {
      const index = match.index ?? 0;
      issues.push({
        type: "duplicate-word",
        message: `重複的字「${word}${word}」，可能是誤植`,
        excerpt: excerptAround(text, index),
        index,
      });
    }
  }

  // Double (or more) spaces within a line.
  const dupSpaceRe = / {2,}/g;
  for (const match of text.matchAll(dupSpaceRe)) {
    const index = match.index ?? 0;
    issues.push({
      type: "spacing",
      message: "連續空格",
      excerpt: excerptAround(text, index),
      index,
    });
  }

  return issues.sort((a, b) => a.index - b.index);
}
