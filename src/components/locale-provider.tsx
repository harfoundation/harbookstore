"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { toSimplified } from "@/lib/i18n/opencc-converter";

export type Locale = "zh-Hant" | "zh-Hans";
const STORAGE_KEY = "harbookstore:locale";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);

// A tiny external store backed by localStorage, synced via useSyncExternalStore
// — avoids the cascading-render issue of reading localStorage + setState in
// an effect (see the same pattern in cart-provider.tsx).
const listeners = new Set<() => void>();
let cachedLocale: Locale | null = null;

function readLocale(): Locale {
  if (cachedLocale) return cachedLocale;
  cachedLocale = localStorage.getItem(STORAGE_KEY) === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  return cachedLocale;
}

function writeLocale(next: Locale) {
  cachedLocale = next;
  localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot(): Locale {
  return "zh-Hant";
}

function convertTextNode(node: Node) {
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;
  const converted = toSimplified(node.nodeValue);
  // Guard against no-op writes so we don't re-trigger the MutationObserver
  // on text that's already simplified (would otherwise risk a feedback loop).
  if (converted !== node.nodeValue) node.nodeValue = converted;
}

function convertSubtree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    convertTextNode(root);
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Node[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }
  nodes.forEach(convertTextNode);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useSyncExternalStore(subscribe, readLocale, getServerSnapshot);

  useEffect(() => {
    if (locale !== "zh-Hans") return;

    convertSubtree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          convertTextNode(mutation.target);
        } else {
          mutation.addedNodes.forEach((node) => convertSubtree(node));
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [locale, pathname]);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
    if (next === "zh-Hant") {
      // Traditional is the source text — reload for a clean, unconverted render
      // rather than attempting a lossy reverse (Simplified→Traditional) conversion.
      window.location.reload();
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
