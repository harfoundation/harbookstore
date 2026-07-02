"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "zh-Hant" ? "zh-Hans" : "zh-Hant")}
    >
      {locale === "zh-Hant" ? "简体" : "繁體"}
    </Button>
  );
}
