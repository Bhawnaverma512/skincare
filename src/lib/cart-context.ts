import { createContext, useContext } from "react";

import type { Product } from "./products";

export const MAX_QUANTITY = 10;
// Amounts in Indian rupees (₹).
export const FREE_SHIPPING_THRESHOLD = 499;
export const SHIPPING_FEE = 49;

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** False until the saved bag has been read from the browser. */
  ready: boolean;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
