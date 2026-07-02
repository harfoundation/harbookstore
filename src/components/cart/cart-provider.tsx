"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

export type CartItem = {
  bookId: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  priceCents: number | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY_ITEMS);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.quantity * (i.priceCents ?? 0),
      0,
    );

    return {
      items,
      itemCount,
      subtotalCents,
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
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
