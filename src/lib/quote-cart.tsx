"use client";

// Global Quote-Cart state
// =====================================================================
// Lightweight React Context store (no Zustand dependency) that backs the
// "Add to Quote" button on every variant row. Persisted to localStorage so
// the cart survives page reloads and direct navigation between catalog
// browsing and the /quote review screen.
// =====================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type QuoteItem = {
  variantId: string; // Prisma ProductVariant.id (or local slug fallback)
  sku: string;
  name: string;
  basePriceUsd: number | null;
  quantity: number;
};

type QuoteCartState = {
  items: QuoteItem[];
  add: (item: Omit<QuoteItem, "quantity"> & { quantity?: number }) => void;
  remove: (sku: string) => void;
  setQuantity: (sku: string, quantity: number) => void;
  clear: () => void;
  has: (sku: string) => boolean;
  count: number;
};

const STORAGE_KEY = "rrm.quote-cart.v1";
const QuoteCartContext = createContext<QuoteCartState | null>(null);

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);

  // Hydrate from localStorage on first client render. Wrapped in try/catch so
  // a corrupt cache never breaks the page.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota / private mode — silent */
    }
  }, [items]);

  const add: QuoteCartState["add"] = useCallback((incoming) => {
    setItems((current) => {
      const existing = current.find((row) => row.sku === incoming.sku);
      if (existing) {
        return current.map((row) =>
          row.sku === incoming.sku
            ? { ...row, quantity: row.quantity + (incoming.quantity ?? 1) }
            : row,
        );
      }
      return [
        ...current,
        {
          variantId: incoming.variantId,
          sku: incoming.sku,
          name: incoming.name,
          basePriceUsd: incoming.basePriceUsd,
          quantity: incoming.quantity ?? 1,
        },
      ];
    });
  }, []);

  const remove = useCallback((sku: string) => {
    setItems((current) => current.filter((row) => row.sku !== sku));
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setItems((current) =>
      current.map((row) =>
        row.sku === sku ? { ...row, quantity: Math.max(1, quantity) } : row,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<QuoteCartState>(
    () => ({
      items,
      add,
      remove,
      setQuantity,
      clear,
      has: (sku) => items.some((row) => row.sku === sku),
      count: items.length,
    }),
    [items, add, remove, setQuantity, clear],
  );

  return (
    <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>
  );
}

export function useQuoteCart(): QuoteCartState {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) {
    throw new Error("useQuoteCart must be used inside <QuoteCartProvider>.");
  }
  return ctx;
}
