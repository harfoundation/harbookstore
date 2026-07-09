"use client";

import Script from "next/script";

// Loads the Google Website Translator engine once, site-wide. The widget UI
// itself stays hidden (see .goog-te-* rules in globals.css) — we only use it
// as a translation engine, driven programmatically via setGoogleTranslateLanguage.
export function GoogleTranslateWidget() {
  return (
    <>
      <div id="google_translate_element" className="hidden" />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              { pageLanguage: "zh-TW", includedLanguages: "en,zh-CN,zh-TW", autoDisplay: false },
              "google_translate_element"
            );
          }
        `}
      </Script>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
