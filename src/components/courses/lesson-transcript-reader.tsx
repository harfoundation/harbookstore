"use client";

import { useState } from "react";
import {
  TRANSCRIPT_LANGUAGES,
  type TranscriptLanguage,
} from "@/lib/courses/transcript-languages";

export type LessonTranscript = {
  language: TranscriptLanguage;
  isOriginal: boolean;
  content: string;
};

function Paragraphs({ transcript }: { transcript: LessonTranscript }) {
  const isChinese = transcript.language === "zh-Hant";
  return (
    <div
      lang={transcript.language}
      // Chinese follows the site's 繁/简 toggle; other languages are left as
      // written and kept away from the page-wide machine translator.
      {...(isChinese ? {} : { "data-no-hans": "", translate: "no" as const })}
      className={`space-y-3 text-sm leading-relaxed ${isChinese ? "" : "notranslate"}`}
    >
      {transcript.content
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p.trim()}
          </p>
        ))}
    </div>
  );
}

export function LessonTranscriptReader({
  transcripts,
}: {
  transcripts: LessonTranscript[];
}) {
  const original = transcripts.find((t) => t.isOriginal) ?? transcripts[0];
  const [primary, setPrimary] = useState<TranscriptLanguage>(original.language);
  const [compare, setCompare] = useState<TranscriptLanguage | "">("");

  const byLanguage = (lang: TranscriptLanguage | "") =>
    transcripts.find((t) => t.language === lang);
  const left = byLanguage(primary) ?? original;
  const right = compare ? byLanguage(compare) : undefined;

  const languageOptions = transcripts.map((t) => (
    <option key={t.language} value={t.language}>
      {TRANSCRIPT_LANGUAGES[t.language]}
      {t.isOriginal ? "（原文）" : ""}
    </option>
  ));

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">講稿</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            aria-label="講稿語言"
            className="bg-background rounded border px-2 py-1"
            value={primary}
            onChange={(e) => setPrimary(e.target.value as TranscriptLanguage)}
          >
            {languageOptions}
          </select>
          {transcripts.length > 1 && (
            <select
              aria-label="對照語言"
              className="bg-background rounded border px-2 py-1"
              value={compare}
              onChange={(e) => setCompare(e.target.value as TranscriptLanguage | "")}
            >
              <option value="">不對照</option>
              {languageOptions}
            </select>
          )}
        </div>
      </div>

      <div
        className={`max-h-[60vh] overflow-y-auto pr-1 ${
          right ? "grid gap-6 md:grid-cols-2" : ""
        }`}
      >
        <Paragraphs transcript={left} />
        {right && <Paragraphs transcript={right} />}
      </div>
    </section>
  );
}
