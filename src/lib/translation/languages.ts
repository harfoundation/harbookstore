// Shared BCP-47 language codes — used as-is by the browser's
// SpeechRecognition (source_lang) and SpeechSynthesis (target_lang) Web
// APIs, and by the MyMemory translation API (both accept this format
// directly, confirmed against their live endpoint).
export const LANGUAGES = [
  { code: "en-US", label: "英文 English" },
  { code: "zh-CN", label: "中文（普通話）Mandarin" },
  { code: "zh-HK", label: "粵語 Cantonese" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
