import type { CartLine } from "./cart-context";
import { getSupabase } from "./supabase";

export type DeliveryMethod = "standard" | "express";
export type PaymentMethod = "cod";

/** Extra charge in ₹ for express delivery. */
export const EXPRESS_FEE = 99;

export interface ShippingDetails {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderInput {
  details: ShippingDetails;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  userId: string | null;
}

export interface PlacedOrder {
  orderNumber: string;
  email: string;
  total: number;
  itemCount: number;
  delivery: DeliveryMethod;
}

/** No 0/O or 1/I, so order numbers are easy to read out over the phone. */
const ORDER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Order numbers like BG-7K4P-M2XD. Anyone with the number can track the order,
 * so it has ~1 trillion combinations to make guessing someone else's impractical.
 */
function newOrderNumber(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = Array.from(bytes, (byte) => ORDER_ALPHABET[byte % ORDER_ALPHABET.length]);
  return `BG-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

/** Matches current order numbers (BG-7K4P-M2XD) and older ones (BG-123456). */
export const ORDER_NUMBER_PATTERN = /^BG-(\d{6}|[A-Z0-9]{4}-[A-Z0-9]{4})$/;

/** Uppercases and tidies what a customer typed, e.g. " bg-7k4p-m2xd " → "BG-7K4P-M2XD". */
export function normalizeOrderNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

/** Saves the order to Supabase. Throws an Error with a shopper-friendly message. */
export async function placeOrder(input: OrderInput): Promise<PlacedOrder> {
  const { details } = input;
  const orderNumber = newOrderNumber();

  // No `.select()` after insert: guests can create orders but not read them back.
  const { error } = await getSupabase()
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      email: details.email,
      full_name: details.fullName,
      phone: details.phone,
      address_line1: details.addressLine1,
      address_line2: details.addressLine2 || null,
      city: details.city,
      state: details.state,
      postal_code: details.postalCode,
      country: "India",
      delivery_method: input.delivery,
      payment_method: input.payment,
      items: input.lines.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })),
      subtotal: roundMoney(input.subtotal),
      shipping: roundMoney(input.shipping),
      total: roundMoney(input.total),
    });

  if (error) {
    console.error("Failed to place order", error);
    if (error.code === "PGRST205" || error.code === "42P01") {
      throw new Error(
        "Checkout isn't set up yet: the orders table is missing in Supabase. Please try again later.",
      );
    }
    if (error.code === "23505") {
      throw new Error("Something went wrong creating your order number. Please try again.");
    }
    throw new Error("We couldn't place your order. Please check your connection and try again.");
  }

  return {
    orderNumber,
    email: details.email,
    total: roundMoney(input.total),
    itemCount: input.lines.reduce((sum, line) => sum + line.quantity, 0),
    delivery: input.delivery,
  };
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface TrackedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  delivery: DeliveryMethod;
  items: TrackedOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  city: string;
  state: string;
  courier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

interface OrderRow {
  order_number: string;
  status: OrderStatus;
  delivery_method: DeliveryMethod;
  items: TrackedOrderItem[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  city: string;
  state: string;
  courier?: string | null;
  tracking_number?: string | null;
  created_at: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}

function toTrackedOrder(row: OrderRow): TrackedOrder {
  return {
    orderNumber: row.order_number,
    status: row.status,
    delivery: row.delivery_method,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    city: row.city,
    state: row.state,
    courier: row.courier ?? null,
    trackingNumber: row.tracking_number ?? null,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? null,
    shippedAt: row.shipped_at ?? null,
    deliveredAt: row.delivered_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
  };
}

const TRACKING_NOT_SET_UP =
  "Order tracking isn't set up yet: run the order-tracking migration in Supabase.";

/** Finds one order by its order number. Returns null if there's no such order. */
export async function trackOrder(orderNumber: string): Promise<TrackedOrder | null> {
  const { data, error } = await getSupabase().rpc("track_order", {
    p_order_number: normalizeOrderNumber(orderNumber),
  });
  if (error) {
    console.error("Failed to track order", error);
    if (error.code === "PGRST202" || error.code === "42883") throw new Error(TRACKING_NOT_SET_UP);
    throw new Error("We couldn't look up your order. Please check your connection and try again.");
  }
  const rows = (data ?? []) as OrderRow[];
  return rows[0] ? toTrackedOrder(rows[0]) : null;
}

/** Orders placed while logged in to the current account, newest first. */
export async function listMyOrders(): Promise<TrackedOrder[]> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load orders", error);
    throw new Error("We couldn't load your orders. Please try again.");
  }
  return (data as OrderRow[]).map(toTrackedOrder);
}

const DELIVERY_DAYS: Record<DeliveryMethod, [number, number]> = {
  standard: [3, 5],
  express: [1, 2],
};

/** Adds business days (Mon–Fri) to a date. */
function addBusinessDays(start: Date, days: number): Date {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date;
}

/** Expected delivery window, counted from when the order shipped (or was placed). */
export function estimatedDelivery(order: TrackedOrder): { from: Date; to: Date } {
  const [min, max] = DELIVERY_DAYS[order.delivery];
  const start = new Date(order.shippedAt ?? order.createdAt);
  // Orders ship within 1–2 business days, so unshipped orders get that added on.
  const handling = order.shippedAt ? 0 : 2;
  return {
    from: addBusinessDays(start, min + (order.shippedAt ? 0 : 1)),
    to: addBusinessDays(start, max + handling),
  };
}
