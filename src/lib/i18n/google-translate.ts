// Programmatic control of the Google Website Translator widget: switching
// the hidden <select class="goog-te-combo"> and firing a change event drives
// the same translation the visible widget would, without showing its UI.
// The widget script loads async, so a switch requested before it's ready is
// retried for a few seconds rather than silently dropped.
export function setGoogleTranslateLanguage(lang: "en" | "") {
  function trigger() {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return false;
    select.value = lang;
    select.dispatchEvent(new Event("change"));
    return true;
  }

  if (trigger()) return;

  let attempts = 0;
  const interval = setInterval(() => {
    attempts += 1;
    if (trigger() || attempts > 20) clearInterval(interval);
  }, 250);
}
