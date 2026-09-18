import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, Heart, Leaf, Recycle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { products, requireProduct, totalReviewCount } from "@/lib/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our story — Beauty Glow" },
      {
        name: "description",
        content:
          "Beauty Glow makes gentle, science-backed skincare that's clean, cruelty-free and kind to your skin.",
      },
    ],
  }),
  component: AboutPage,
});

const storyProducts = [requireProduct("glycolic-glow-serum"), requireProduct("moisturiser")];

const values = [
  {
    icon: Leaf,
    title: "Clean by design",
    text: "We formulate without parabens, sulfates, mineral oil or synthetic dyes — and we list every ingredient clearly.",
  },
  {
    icon: FlaskConical,
    title: "Backed by science",
    text: "Each product is built around proven actives at effective levels, balanced with soothing support ingredients.",
  },
  {
    icon: Heart,
    title: "Kind, always",
    text: "Our products are cruelty-free and gentle enough for sensitive skin, because great skincare shouldn't hurt.",
  },
  {
    icon: Recycle,
    title: "Better packaging",
    text: "We choose recyclable glass, aluminum and post-consumer plastics wherever possible, and keep packaging minimal.",
  },
];

const stats = [
  { value: `${products.length}`, label: "Essential formulas" },
  { value: `${Math.floor(totalReviewCount / 1000)}k+`, label: "Customer reviews" },
  { value: "100%", label: "Cruelty-free" },
  { value: "30-day", label: "Happy-skin guarantee" },
];

function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="Skincare that respects your skin">
        Beauty Glow started with a simple belief: healthy, radiant skin comes from a few thoughtful
        products — not a crowded shelf.
      </PageHeader>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="grid grid-cols-2 gap-4">
          {storyProducts.map((product, index) => (
            <ProductImage
              key={product.id}
              shape={product.shape}
              tint={product.tint}
              backdrop={product.backdrop}
              image={product.image}
              alt={product.name}
              className={index === 1 ? "mt-12 rounded-3xl" : "rounded-3xl"}
            />
          ))}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Why we exist
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Less noise. More glow.
          </h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>
              Skincare had become confusing — endless steps, harsh formulas and claims that were
              hard to trust. We wanted something different: a small collection of products that each
              do their job beautifully.
            </p>
            <p>
              Every Beauty Glow formula is developed around ingredients with real evidence behind
              them, then refined until it feels as good as it performs. If it doesn't earn a place
              in your routine, it doesn't make it into our collection.
            </p>
            <p>
              The result is skincare that's simple to use, gentle on your skin and designed to help
              you feel confident in your own glow.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/50">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-center sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl font-semibold text-primary sm:text-5xl">
                {stat.value}
              </dd>
              <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            What we stand for
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Our values</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border/60 bg-card p-8">
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 md:pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display text-4xl font-semibold">Ready to find your glow?</h2>
          <p className="mx-auto mt-3 max-w-lg opacity-90">
            Explore the collection and build a simple routine that works for your skin.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 h-12 rounded-full px-8">
            <Link to="/shop">
              Shop the collection <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
