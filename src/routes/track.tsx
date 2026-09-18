import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MessageSquareWarning,
  Package,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import {
  estimatedDelivery,
  listMyOrders,
  normalizeOrderNumber,
  ORDER_NUMBER_PATTERN,
  trackOrder,
  type OrderStatus,
  type TrackedOrder,
} from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

interface TrackSearch {
  order?: string;
}

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): TrackSearch =>
    typeof search["order"] === "string" ? { order: search["order"] } : {},
  head: () => ({
    meta: [
      { title: "Track your order — Beauty Glow" },
      { name: "description", content: "Check the status and delivery estimate of your order." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { order: orderFromUrl } = Route.useSearch();
  const { user, ready } = useAuth();
  const [orderNumber, setOrderNumber] = useState(orderFromUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);

  const [myOrders, setMyOrders] = useState<TrackedOrder[] | null>(null);
  const [myOrdersError, setMyOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMyOrders(null);
      return;
    }
    let active = true;
    listMyOrders()
      .then((orders) => active && setMyOrders(orders))
      .catch((err: Error) => active && setMyOrdersError(err.message));
    return () => {
      active = false;
    };
  }, [user]);

  async function lookUp(value: string) {
    const normalized = normalizeOrderNumber(value);
    if (!ORDER_NUMBER_PATTERN.test(normalized)) {
      setError("Enter your order number exactly as shown on your confirmation, e.g. BG-7K4P-M2XD.");
      return;
    }
    setOrderNumber(normalized);
    setError(null);
    setResult(null);
    setSearching(true);
    try {
      const order = await trackOrder(normalized);
      if (order) setResult(order);
      else setError(`We couldn't find order ${normalized}. Please check the number and try again.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  // Opened from the order confirmation ("Track this order"): look it up straight away.
  useEffect(() => {
    if (orderFromUrl) void lookUp(orderFromUrl);
  }, [orderFromUrl]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookUp(orderNumber);
  }

  const otherOrders = myOrders?.filter((order) => order.orderNumber !== result?.orderNumber);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Track your order">
        Enter the order number from your order confirmation to see where your parcel is.
      </PageHeader>

      <section className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 md:py-20">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="order-number">Order number</Label>
              <Input
                id="order-number"
                placeholder="BG-7K4P-M2XD"
                autoComplete="off"
                spellCheck={false}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="h-12 rounded-xl text-base uppercase tracking-wider"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-full px-8" disabled={searching}>
              {searching ? <Loader2 className="animate-spin" /> : <Search />}
              Track order
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-4 flex gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </form>

        {result && <OrderDetails order={result} />}

        {ready && user && (
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Your orders</h2>
            {myOrdersError ? (
              <p className="mt-4 text-sm text-destructive">{myOrdersError}</p>
            ) : myOrders === null ? (
              <Loader2 className="mt-6 size-6 animate-spin text-muted-foreground" />
            ) : otherOrders!.length === 0 ? (
              <p className="mt-4 text-muted-foreground">
                {result ? "No other orders on this account." : "No orders on this account yet."}{" "}
                <Link to="/shop" className="font-medium text-primary hover:underline">
                  Start shopping
                </Link>
              </p>
            ) : (
              <div className="mt-6 space-y-6">
                {otherOrders!.map((order) => (
                  <OrderDetails key={order.orderNumber} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {ready && !user && (
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>{" "}
            to see every order placed with your account.
          </p>
        )}
      </section>
    </>
  );
}

const STEPS: { status: Exclude<OrderStatus, "cancelled">; label: string; icon: typeof Package }[] =
  [
    { status: "pending", label: "Order placed", icon: ClipboardCheck },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: PackageCheck },
  ];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function stepDate(order: TrackedOrder, status: OrderStatus): string | null {
  const value = {
    pending: order.createdAt,
    confirmed: order.confirmedAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
    cancelled: order.cancelledAt,
  }[status];
  return value ? dateFormatter.format(new Date(value)) : null;
}

function OrderDetails({ order }: { order: TrackedOrder }) {
  const cancelled = order.status === "cancelled";
  const currentStep = STEPS.findIndex((step) => step.status === order.status);
  const eta = estimatedDelivery(order);

  return (
    <article className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order</p>
          <h3 className="mt-1 text-xl font-semibold">{order.orderNumber}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {fullDateFormatter.format(new Date(order.createdAt))} · Shipping to {order.city},{" "}
            {order.state}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            cancelled
              ? "bg-destructive/10 text-destructive"
              : order.status === "delivered"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-secondary text-primary",
          )}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </header>

      {cancelled ? (
        <div className="mt-6 flex gap-3 rounded-2xl bg-destructive/5 p-4 text-sm">
          <XCircle className="size-5 shrink-0 text-destructive" />
          <p>
            This order was cancelled
            {order.cancelledAt && ` on ${fullDateFormatter.format(new Date(order.cancelledAt))}`}.
            Questions? Call us on {site.phone}.
          </p>
        </div>
      ) : (
        <>
          <ol className="mt-8 grid grid-cols-4">
            {STEPS.map((step, index) => {
              const done = index <= currentStep;
              const Icon = step.icon;
              return (
                <li key={step.status} className="relative flex flex-col items-center text-center">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2",
                        done ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex size-10 items-center justify-center rounded-full border-2",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "mt-2 text-xs sm:text-sm",
                      done ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {done ? (stepDate(order, step.status) ?? "Done") : " "}
                  </span>
                </li>
              );
            })}
          </ol>

          <dl className="mt-8 grid gap-4 rounded-2xl bg-secondary/60 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">
                {order.status === "delivered" ? "Delivered on" : "Estimated delivery"}
              </dt>
              <dd className="mt-0.5 font-medium">
                {order.status === "delivered" && order.deliveredAt
                  ? fullDateFormatter.format(new Date(order.deliveredAt))
                  : `${dateFormatter.format(eta.from)} – ${fullDateFormatter.format(eta.to)}`}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="mt-0.5 font-medium">
                {order.delivery === "express" ? "Express (1–2 days)" : "Standard (3–5 days)"}
              </dd>
            </div>
            {(order.courier || order.trackingNumber) && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Courier & tracking number</dt>
                <dd className="mt-0.5 font-medium">
                  {[order.courier, order.trackingNumber].filter(Boolean).join(" · ")}
                </dd>
              </div>
            )}
          </dl>
        </>
      )}

      <ul className="mt-6 divide-y divide-border text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-2">
            <span>
              {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 pt-3 font-semibold">
          <span>Total (cash on delivery)</span>
          <span>{formatPrice(order.total)}</span>
        </li>
      </ul>

      <Button asChild variant="outline" size="sm" className="mt-6 rounded-full">
        <Link to="/contact" search={{ topic: "Problem with my order", order: order.orderNumber }}>
          <MessageSquareWarning /> Report a problem with this order
        </Link>
      </Button>
    </article>
  );
}
