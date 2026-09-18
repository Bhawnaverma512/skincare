import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ShoppingBag, Trash2 } from "lucide-react";

import { ProductImage } from "@/components/site/ProductImage";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { Button } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD, shippingFor, useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your bag — Beauty Glow" }] }),
  component: CartPage,
});

function CartPage() {
  const { lines, count, subtotal, ready, setQuantity, remove } = useCart();

  if (!ready) return <div className="min-h-[50vh]" aria-busy="true" />;
  if (lines.length === 0) return <EmptyBag />;

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your bag</h1>
      <p className="mt-2 text-muted-foreground">
        {count} {count === 1 ? "item" : "items"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-border border-y border-border">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 py-6 sm:gap-6">
              <Link
                to="/products/$productId"
                params={{ productId: product.id }}
                className="w-24 shrink-0 overflow-hidden rounded-2xl sm:w-28"
              >
                <ProductImage
                  shape={product.shape}
                  tint={product.tint}
                  backdrop={product.backdrop}
                  image={product.image}
                  alt={product.name}
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold leading-snug">
                      <Link
                        to="/products/$productId"
                        params={{ productId: product.id }}
                        className="hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {product.size} · {formatPrice(product.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">{formatPrice(product.price * quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <QuantityStepper
                    value={quantity}
                    onChange={(value) => setQuantity(product.id, value)}
                    label={`Quantity for ${product.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl bg-secondary/60 p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>

          <div className="mt-5">
            <p className="text-sm">
              {remaining > 0 ? (
                <>
                  You're <strong>{formatPrice(remaining)}</strong> away from free shipping
                </>
              ) : (
                <>You've unlocked free shipping!</>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-6 h-12 w-full rounded-full">
            <Link to="/checkout">
              <Lock /> Checkout
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Cash on delivery available across India.
          </p>
          <Link
            to="/shop"
            className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Continue shopping <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

function EmptyBag() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <ShoppingBag className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Your bag is empty</h1>
      <p className="mt-3 text-muted-foreground">
        Discover gentle, effective formulas made for glowing skin.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 rounded-full px-8">
        <Link to="/shop">
          Start shopping <ArrowRight />
        </Link>
      </Button>
    </section>
  );
}
