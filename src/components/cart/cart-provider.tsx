"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeSeriesDiscounts } from "@/lib/pricing/series-discount";

export type CartItem = {
  bookId: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  priceCents: number | null;
  groupBuyPriceCents: number | null;
  groupBuyMinQty: number | null;
  categoryId: string | null;
  posterNumber: number | null;
  quantity: number;
};

// Mirrors the server-side rule in src/lib/actions/orders.ts
// (resolveUnitPriceCents) — this is a display preview only, the server
// always recomputes the real price at order time.
export function baseUnitPriceCents(item: CartItem): number {
  if (
    item.groupBuyPriceCents != null &&
    item.groupBuyMinQty != null &&
    item.quantity >= item.groupBuyMinQty
  ) {
    return item.groupBuyPriceCents;
  }
  return item.priceCents ?? 0;
}

/** @deprecated use CartContext's `itemPricing` map, which also accounts for
 * the series/full-set bundle discount — this only resolves the group-buy
 * price and is kept for any external pure-function callers. */
export const effectiveUnitPriceCents = baseUnitPriceCents;

export type CartItemPricing = { unitPriceCents: number; discountLabel: string | null };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  itemPricing: Map<string, CartItemPricing>;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "harbookstore:cart";
const EMPTY_ITEMS: CartItem[] = [];

// A tiny external store backed by localStorage, synced via useSyncExternalStore
// — this is the React-recommended way to read/write a browser-only mutable
// source without the cascading-render issue of setState-in-an-effect.
const listeners = new Set<() => void>();
let cachedItems: CartItem[] | null = null;

function readItems(): CartItem[] {
  if (cachedItems) return cachedItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cachedItems = raw ? JSON.parse(raw) : [];
  } catch {
    cachedItems = [];
  }
  return cachedItems!;
}

function writeItems(items: CartItem[]) {
  cachedItems = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked (e.g. Safari with tracking prevention) — cart still
    // works for this session via cachedItems, just doesn't persist.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY_ITEMS);

  // Fetched once — the denominator for the "whole 50-book set" discount.
  // Until it loads, that tier just doesn't apply yet (falls back to 0,
  // same as "no discount"); the server always recomputes authoritatively.
  const [totalSeriesBookCount, setTotalSeriesBookCount] = useState(0);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .not("poster_number", "is", null)
      .then(({ count }) => setTotalSeriesBookCount(count ?? 0));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    const discounts = computeSeriesDiscounts(
      items.map((i) => ({
        bookId: i.bookId,
        categoryId: i.categoryId ?? null,
        posterNumber: i.posterNumber ?? null,
      })),
      totalSeriesBookCount,
    );
    const itemPricing = new Map<string, CartItemPricing>(
      items.map((i) => {
        const discount = discounts.get(i.bookId);
        const unitPriceCents = Math.round(baseUnitPriceCents(i) * (discount?.multiplier ?? 1));
        return [i.bookId, { unitPriceCents, discountLabel: discount?.label ?? null }];
      }),
    );
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.quantity * (itemPricing.get(i.bookId)?.unitPriceCents ?? 0),
      0,
    );

    return {
      items,
      itemCount,
      subtotalCents,
      itemPricing,
      addItem: (item, quantity = 1) => {
        const existing = items.find((i) => i.bookId === item.bookId);
        const next = existing
          ? items.map((i) =>
              i.bookId === item.bookId ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...items, { ...item, quantity }];
        writeItems(next);
      },
      removeItem: (bookId) => {
        writeItems(items.filter((i) => i.bookId !== bookId));
      },
      setQuantity: (bookId, quantity) => {
        writeItems(
          quantity <= 0
            ? items.filter((i) => i.bookId !== bookId)
            : items.map((i) => (i.bookId === bookId ? { ...i, quantity } : i)),
        );
      },
      clear: () => writeItems([]),
    };
  }, [items, totalSeriesBookCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
