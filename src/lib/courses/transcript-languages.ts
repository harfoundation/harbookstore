// Languages a lesson transcript can be stored in (must match the check
// constraint on lesson_transcripts.language). Simplified Chinese is not
// listed: the site's 繁/简 toggle converts zh-Hant on the fly.
export const TRANSCRIPT_LANGUAGES = {
  "zh-Hant": "中文",
  en: "English",
  ko: "한국어",
  ja: "日本語",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  es: "Español",
  fr: "Français",
  pt: "Português",
} as const;

export type TranscriptLanguage = keyof typeof TRANSCRIPT_LANGUAGES;

export const TRANSCRIPT_LANGUAGE_CODES = Object.keys(TRANSCRIPT_LANGUAGES) as [
  TranscriptLanguage,
  ...TranscriptLanguage[],
];
