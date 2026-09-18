import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CalendarClock,
  Check,
  ChevronRight,
  PackageOpen,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { ProductReviews } from "@/components/site/ProductReviews";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { Rating } from "@/components/site/Rating";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD, useCart } from "@/lib/cart-context";
import { formatPrice, getProduct, products } from "@/lib/products";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Beauty Glow` },
          {
            name: "description",
            content: `${loaderData.product.tagline}. ${loaderData.product.description}`,
          },
        ]
      : [{ title: "Product not found — Beauty Glow" }],
  }),
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const navigate = Route.useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [product.id]);

  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter(
      (p) => p.id !== product.id && p.category !== product.category && p.bestseller,
    ),
  ].slice(0, 4);

  function handleAdd() {
    add(product.id, quantity);
    toast.success(`${quantity} × ${product.name} added to your bag`, {
      action: { label: "View bag", onClick: () => void navigate({ to: "/cart" }) },
    });
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/shop"
            search={{ category: product.category }}
            className="hover:text-foreground"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground" aria-current="page">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 md:grid-cols-2 md:gap-14 md:py-12">
        <div className="relative">
          <ProductImage
            shape={product.shape}
            tint={product.tint}
            backdrop={product.backdrop}
            image={product.image}
            alt={product.name}
            className="rounded-3xl md:sticky md:top-32"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
              {product.badge}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <Rating value={product.rating} />
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">
              · {product.reviewCount.toLocaleString("en-IN")} reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            <span className="text-sm text-muted-foreground">{product.size}</span>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6">
            <h2 className="text-sm font-semibold">Best for</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {product.skinTypes.map((type) => (
                <li key={type} className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {type}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button
              size="lg"
              className="h-11 flex-1 rounded-full sm:flex-none sm:px-10"
              onClick={handleAdd}
            >
              <ShoppingBag /> Add to bag · {formatPrice(product.price * quantity)}
            </Button>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> Free shipping on orders over{" "}
              {formatPrice(FREE_SHIPPING_THRESHOLD)}
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="size-4 text-primary" /> 30-day happy-skin guarantee
            </li>
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex gap-3 rounded-2xl border border-border/60 p-4">
              <CalendarClock className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Shelf life (unopened)</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {product.shelfLifeMonths} months from manufacture
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-border/60 p-4">
              <PackageOpen className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">After opening</p>
                <p className="mt-0.5 text-sm font-semibold">
                  Use within {product.afterOpeningMonths} months
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-secondary/60 p-5">
            <h2 className="text-sm font-semibold">Why you'll love it</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <Accordion type="single" collapsible defaultValue="ingredients" className="mt-6">
            <AccordionItem value="ingredients">
              <AccordionTrigger className="text-base">Key ingredients</AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-3">
                  {product.ingredients.map((ingredient) => (
                    <div key={ingredient.name}>
                      <dt className="font-medium">{ingredient.name}</dt>
                      <dd className="text-muted-foreground">{ingredient.benefit}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-to-use">
              <AccordionTrigger className="text-base">How to use</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {product.howToUse}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="validity">
              <AccordionTrigger className="text-base">Validity & storage</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Unopened, this product is good for {product.shelfLifeMonths} months from its
                  manufacturing date. The exact manufacturing and expiry dates are printed on the
                  pack.
                </p>
                <p>
                  Once opened, use it within {product.afterOpeningMonths} months — look for the
                  open-jar symbol marked “{product.afterOpeningMonths}M”.
                </p>
                <p>
                  Store below 30°C, away from direct sunlight, with the cap tightly closed. Don't
                  use it if the colour, smell or texture changes.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-base">Shipping & returns</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Orders ship within 1–2 business days. Shipping is free over{" "}
                {formatPrice(FREE_SHIPPING_THRESHOLD)}. Not the right fit? Contact us within 30 days
                of delivery and we'll make it right.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <ProductReviews product={product} />

      {related.length > 0 && (
        <section className="bg-secondary/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Pairs well with</h2>
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Product not found</h1>
      <p className="mt-3 text-muted-foreground">
        This product may have been renamed or is no longer available.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/shop">Browse all products</Link>
      </Button>
    </div>
  );
}
