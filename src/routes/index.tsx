import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, FlaskConical, Leaf, Rabbit, Recycle, Sparkles } from "lucide-react";

import { Newsletter } from "@/components/site/Newsletter";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { Rating } from "@/components/site/Rating";
import { Button } from "@/components/ui/button";
import { categories, products, requireProduct, totalReviewCount } from "@/lib/products";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: HomePage,
});

const heroProduct = requireProduct("glycolic-glow-serum");
const heroSideProduct = requireProduct("moisturiser");

const promises = [
  { icon: Leaf, title: "Clean ingredients", text: "No parabens, sulfates or mineral oil." },
  { icon: FlaskConical, title: "Science-backed", text: "Proven actives at effective levels." },
  { icon: Rabbit, title: "Cruelty-free", text: "Never tested on animals. Ever." },
  { icon: Recycle, title: "Better packaging", text: "Recyclable glass and aluminum." },
];

const routine = [
  {
    step: "01",
    title: "Cleanse",
    text: "Start fresh with a gentle wash that removes the day without stripping your skin.",
    product: requireProduct("face-wash"),
  },
  {
    step: "02",
    title: "Treat",
    text: "Target your main concern with a lightweight serum packed with proven actives.",
    product: requireProduct("glycolic-glow-serum"),
  },
  {
    step: "03",
    title: "Protect",
    text: "Shield skin from daily UV with a broad-spectrum SPF that evens out your tone.",
    product: requireProduct("tinted-sunscreen-spf-50"),
  },
];

const acneCarePoints = [
  "Gentle care that won't strip or irritate",
  "Helps control excess oil and shine",
  "Soothes and calms the look of redness",
];

const spotlight = [
  { name: "Glycolic Acid", text: "Gently exfoliates for smoother, brighter-looking skin." },
  { name: "Hyaluronic Acid", text: "Draws in moisture for plump, bouncy skin." },
  { name: "Vitamin E", text: "Nourishes and helps protect skin from dryness." },
  { name: "Niacinamide", text: "Evens skin tone and refines the look of pores." },
];

const freeFrom = [
  "Parabens",
  "Sulfates",
  "Mineral oil",
  "Phthalates",
  "Synthetic dyes",
  "Animal testing",
];

const testimonials = [
  {
    quote:
      "My skin feels so much smoother. The Glycolic Glow Serum has become my favourite night-time step.",
    name: "Priya S.",
    detail: "Glycolic Glow Serum",
  },
  {
    quote:
      "I have really sensitive skin and the face wash doesn't sting or leave me tight. Finally found my holy grail.",
    name: "Hannah L.",
    detail: "Face Wash",
  },
  {
    quote:
      "The tinted sunscreen evens out my skin with zero white cast. I've already ordered my third tube.",
    name: "Maya R.",
    detail: "Tinted Sunscreen SPF 50 PA+++",
  },
];

function HomePage() {
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-2 md:pb-28 md:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="size-3.5 text-primary" /> Clean, science-backed skincare
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Skin that glows <em className="font-medium text-primary">from within.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Gentle formulas made with skin-loving ingredients — so your routine feels simple and
              your skin looks its healthiest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7">
                <Link to="/shop">
                  Shop the collection <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
                <Link to="/skin-finder">Find my routine</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Rating value={5} />
              <span>
                Loved in{" "}
                <strong className="font-semibold text-foreground">
                  {totalReviewCount.toLocaleString("en-IN")}+
                </strong>{" "}
                customer reviews
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 size-80 rounded-full bg-accent blur-3xl"
            />
            <Link to="/shop" className="relative block">
              <img
                src="/images/all-products.jpg"
                alt="The Beauty Glow skincare collection: serums, face wash, sunscreens and moisturiser"
                width={1000}
                height={914}
                fetchPriority="high"
                className="w-full rounded-[2rem] object-cover shadow-sm"
              />
            </Link>
            <Link
              to="/products/$productId"
              params={{ productId: heroSideProduct.id }}
              className="absolute -bottom-8 -left-3 block w-28 overflow-hidden rounded-2xl border-4 border-background shadow-lg sm:-left-10 sm:w-40"
            >
              <ProductImage
                shape={heroSideProduct.shape}
                tint={heroSideProduct.tint}
                backdrop={heroSideProduct.backdrop}
                image={heroSideProduct.image}
                alt={heroSideProduct.name}
              />
            </Link>
            <Link
              to="/products/$productId"
              params={{ productId: heroProduct.id }}
              className="absolute -right-2 top-8 rounded-2xl bg-background/95 px-4 py-3 shadow-lg transition-shadow hover:shadow-xl sm:-right-8"
            >
              <p className="text-xs text-muted-foreground">#1 Bestseller</p>
              <p className="font-display text-lg font-semibold leading-tight">{heroProduct.name}</p>
              <Rating value={heroProduct.rating} className="mt-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="border-y border-border/60 bg-secondary/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                <Icon className="size-5" />
              </span>
              <div className="mt-3 sm:mt-0">
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <SectionHeading eyebrow="Shop by category" title="Everything your routine needs" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to="/shop"
              search={{ category: category.name }}
              className="group rounded-2xl border border-border/60 bg-card p-3 transition-shadow hover:shadow-md"
            >
              <ProductImage
                shape={category.shape}
                tint={category.tint}
                backdrop={category.backdrop}
                image={category.image}
                className="rounded-xl transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <h3 className="mt-3 font-display text-lg font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bg-secondary/40 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Bestsellers" title="Our most-loved formulas" align="left" />
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all products <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Routine */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <SectionHeading eyebrow="Keep it simple" title="Your 3-step glow routine">
          Healthy skin doesn't need twelve steps. Build your routine around three essentials.
        </SectionHeading>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {routine.map(({ step, title, text, product }) => (
            <div
              key={step}
              className="flex flex-col rounded-3xl border border-border/60 bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-semibold text-primary/70">{step}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Step
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              <Link
                to="/products/$productId"
                params={{ productId: product.id }}
                className="mt-6 flex items-center gap-4 rounded-2xl bg-secondary/60 p-3 transition-colors hover:bg-secondary"
              >
                <ProductImage
                  shape={product.shape}
                  tint={product.tint}
                  backdrop={product.backdrop}
                  image={product.image}
                  className="w-16 shrink-0 rounded-xl"
                />
                <span className="text-sm font-medium">{product.name}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Acne-prone skin banner */}
      <section className="px-4 pb-20 sm:px-6 md:pb-24">
        <div className="mx-auto grid max-w-6xl items-center overflow-hidden rounded-3xl bg-secondary/60 md:grid-cols-2">
          <img
            src="/images/acne-care-banner.jpg"
            alt="Clear-pore face wash, face serum, moisturiser and spot treatment for acne-prone skin"
            width={1000}
            height={1000}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover"
          />
          <div className="px-6 py-10 sm:px-10 md:py-12">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Acne-prone skin
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Clearer-looking skin, gently.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Breakouts need care, not harshness. A simple routine of a gentle cleanser, a
              lightweight treatment and a non-greasy moisturiser helps skin look calmer and clearer
              over time.
            </p>
            <ul className="mt-6 space-y-3">
              {acneCarePoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7">
                <Link to="/shop">
                  Build your routine <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
                <Link to="/contact">Ask our skin team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient spotlight */}
      <section className="bg-accent/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              What's inside matters
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Ingredients you can trust, in amounts that work.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every Beauty Glow formula is built around proven actives and gentle supporting
              ingredients. We list everything clearly, so you always know what you're putting on
              your skin.
            </p>
            <h3 className="mt-8 text-sm font-semibold">Always made without</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {freeFrom.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {spotlight.map((ingredient) => (
              <div key={ingredient.name} className="rounded-2xl bg-background p-6">
                <dt className="font-display text-xl font-semibold">{ingredient.name}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{ingredient.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <SectionHeading eyebrow="Real results" title="What our community says" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-3xl border border-border/60 bg-card p-7"
            >
              <Rating value={5} />
              <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{testimonial.name}</span>
                <span className="block text-muted-foreground">
                  Verified buyer · {testimonial.detail}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
    </div>
  );
}
