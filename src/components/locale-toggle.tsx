"use client";

import { Button } from "@/components/ui/button";
import { useLocale, type Locale } from "@/components/locale-provider";

const LABELS: Record<Locale, string> = {
  "zh-Hant": "繁體",
  "zh-Hans": "简体",
  en: "EN",
};

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-0.5">
      {(Object.keys(LABELS) as Locale[]).map((l) => (
        <Button
          key={l}
          variant={locale === l ? "secondary" : "ghost"}
          size="sm"
          className="px-2"
          onClick={() => setLocale(l)}
        >
          {LABELS[l]}
        </Button>
      ))}
    </div>
  );
}
