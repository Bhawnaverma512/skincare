import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { CartContext, MAX_QUANTITY, type CartContextValue } from "./cart-context";
import { getProduct } from "./products";

const STORAGE_KEY = "beauty-glow-cart";

interface StoredItem {
  id: string;
  quantity: number;
}

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
}

function readStoredItems(): StoredItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is StoredItem =>
          typeof item?.id === "string" &&
          typeof item?.quantity === "number" &&
          item.quantity > 0 &&
          getProduct(item.id) !== undefined,
      )
      .map((item) => ({ id: item.id, quantity: clampQuantity(item.quantity) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [ready, setReady] = useState(false);

  // localStorage only exists in the browser, so load after the server render.
  useEffect(() => {
    setItems(readStoredItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private mode); the bag still works for this visit.
    }
  }, [items, ready]);

  const add = useCallback((id: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
        );
      }
      return [...prev, { id, quantity: clampQuantity(quantity) }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) =>
            item.id === id ? { ...item, quantity: clampQuantity(quantity) } : item,
          ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = items.flatMap((item) => {
      const product = getProduct(item.id);
      return product ? [{ product, quantity: item.quantity }] : [];
    });
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [items, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
