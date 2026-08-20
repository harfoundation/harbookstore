import "server-only";

// Free, keyless machine translation via MyMemory (mymemory.translated.net).
// Kept behind this single function so swapping to a paid provider (Azure
// Speech Translation, Google Cloud Translation, etc.) later — e.g. if this
// grows into a commercial product needing better quality/reliability — only
// means rewriting the body of this function, nothing that calls it.
//
// Caveat: MyMemory has no dedicated Cantonese model. "zh-HK" gets it to
// return Traditional Chinese written form, which is what Cantonese-literate
// readers read natively, but it is not colloquial spoken Cantonese
// phrasing — no free MT engine does that well today.

type MyMemoryMatch = {
  translation: string;
  quality: number | string;
};

type MyMemoryResponse = {
  responseData: { translatedText: string };
  matches?: MyMemoryMatch[];
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("langpair", `${sourceLang}|${targetLang}`);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`翻譯服務錯誤（${res.status}）`);
  const data: MyMemoryResponse = await res.json();

  if (data.responseData.translatedText) return data.responseData.translatedText;

  // Top-level result is sometimes empty — fall back to the best-quality
  // match from the alternatives MyMemory also returns.
  const best = (data.matches ?? [])
    .filter((m) => m.translation)
    .sort((a, b) => Number(b.quality) - Number(a.quality))[0];
  return best?.translation ?? "";
}
