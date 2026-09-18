import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Droplets, RotateCcw, ShoppingBag, Sparkles, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductImage } from "@/components/site/ProductImage";
import { Rating } from "@/components/site/Rating";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import {
  buildRoutine,
  concernProductId,
  concerns,
  getSkinType,
  isConcern,
  isSkinType,
  skinTypes,
  type Concern,
  type SkinType,
} from "@/lib/skin-finder";
import { cn } from "@/lib/utils";

interface FinderSearch {
  skin?: SkinType | undefined;
  concern?: Concern | undefined;
}

export const Route = createFileRoute("/skin-finder")({
  validateSearch: (search: Record<string, unknown>): FinderSearch => {
    const skin = search["skin"];
    const concern = search["concern"];
    return {
      ...(isSkinType(skin) ? { skin } : {}),
      ...(isConcern(concern) ? { concern } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Skin Finder — Beauty Glow" },
      {
        name: "description",
        content:
          "Find the best Beauty Glow products for oily, normal or combination skin and shop your personalised routine.",
      },
    ],
  }),
  component: SkinFinderPage,
});

const skinTypeIcons = { oily: Droplets, normal: Sun, combination: Sparkles } as const;

function SkinFinderPage() {
  const { skin, concern } = Route.useSearch();
  const navigate = Route.useNavigate();

  function update(next: FinderSearch) {
    void navigate({ search: next, replace: true, resetScroll: false });
  }

  return (
    <>
      <PageHeader eyebrow="Skin Finder" title="Find your perfect routine">
        Tell us about your skin and we'll match you with the products that suit it best — then shop
        your routine in one click.
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <StepHeading number={1} title="What's your skin type?" />
        <div role="radiogroup" aria-label="Skin type" className="mt-6 grid gap-4 md:grid-cols-3">
          {skinTypes.map((type) => {
            const Icon = skinTypeIcons[type.id];
            const selected = skin === type.id;
            return (
              <button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ skin: type.id, concern })}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-3xl border-2 bg-card p-6 text-left transition-colors",
                  selected
                    ? "border-primary bg-secondary/60"
                    : "border-border/60 hover:border-primary/40",
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="mt-4 font-display text-2xl font-semibold">{type.label} skin</span>
                <span className="mt-1 text-sm text-muted-foreground">{type.signs}</span>
                {selected && (
                  <span className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-12">
          <StepHeading number={2} title="Any main concern?" optional />
          <div className="mt-5 flex flex-wrap gap-2">
            {concerns.map((item) => {
              const selected = concern === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ skin, concern: selected ? undefined : item.id })}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="your-routine" className="scroll-mt-32 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          {skin ? (
            <RoutineResults
              key={`${skin}-${concern ?? "none"}`}
              skin={skin}
              concern={concern}
              onReset={() => update({})}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-background/60 px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold">Your routine will appear here</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose oily, normal or combination skin above to see your matches.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StepHeading({
  number,
  title,
  optional = false,
}: {
  number: number;
  title: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <h2 className="font-display text-3xl font-semibold tracking-tight">
        {title}
        {optional && (
          <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </h2>
    </div>
  );
}

function RoutineResults({
  skin,
  concern,
  onReset,
}: {
  skin: SkinType;
  concern: Concern | undefined;
  onReset: () => void;
}) {
  const { add } = useCart();
  const skinType = getSkinType(skin);
  const routine = useMemo(() => buildRoutine(skin, concern), [skin, concern]);
  const concernId = concernProductId(concern);
  const concernLabel = concerns.find((item) => item.id === concern)?.label;

  // Every product starts selected; shoppers untick what they don't want.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(routine.map((step) => step.product.id)),
  );
  const [added, setAdded] = useState(false);

  const chosen = routine.filter((step) => selected.has(step.product.id));
  const total = chosen.reduce((sum, step) => sum + step.product.price, 0);

  function toggle(id: string, checked: boolean) {
    setAdded(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function addChosen() {
    for (const step of chosen) add(step.product.id);
    setAdded(true);
    toast.success(
      `${chosen.length} ${chosen.length === 1 ? "product" : "products"} added to your bag`,
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Your matches
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Best for {skinType.label.toLowerCase()} skin
            {concernLabel && <span className="text-primary"> + {concernLabel.toLowerCase()}</span>}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{skinType.summary}</p>
        </div>
        <Button variant="ghost" className="rounded-full" onClick={onReset}>
          <RotateCcw /> Start over
        </Button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ol className="space-y-4">
          {routine.map((step, index) => {
            const { product } = step;
            const checked = selected.has(product.id);
            const targetsConcern = product.id === concernId;
            return (
              <li
                key={product.id}
                className={cn(
                  "flex gap-4 rounded-3xl border bg-background p-4 transition-opacity sm:gap-5 sm:p-5",
                  checked ? "border-border/60" : "border-dashed border-border opacity-60",
                )}
              >
                <Link
                  to="/products/$productId"
                  params={{ productId: product.id }}
                  className="w-24 shrink-0 overflow-hidden rounded-2xl sm:w-32"
                >
                  <ProductImage
                    shape={product.shape}
                    tint={product.tint}
                    backdrop={product.backdrop}
                    image={product.image}
                    alt={product.name}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Step {index + 1} · {step.step}
                    </span>
                    {targetsConcern && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Targets {concernLabel?.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold leading-snug">
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.why}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Rating value={product.rating} />
                    <span>
                      {product.rating} · {product.size}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between gap-3">
                  <span className="font-medium">{formatPrice(product.price)}</span>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggle(product.id, value === true)}
                      aria-label={`Include ${product.name}`}
                    />
                    <span className="hidden sm:inline">Include</span>
                  </label>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="h-fit rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-32">
          <h3 className="font-display text-2xl font-semibold">Your routine</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Products selected</dt>
              <dd className="font-medium">
                {chosen.length} of {routine.length}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-3 text-base">
              <dt>Total</dt>
              <dd className="font-semibold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button
            size="lg"
            className="mt-6 h-12 w-full rounded-full"
            disabled={chosen.length === 0}
            onClick={addChosen}
          >
            <ShoppingBag /> Add {chosen.length === routine.length ? "routine" : "selected"} to bag
          </Button>
          {chosen.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tick at least one product.
            </p>
          )}

          {added && (
            <Button asChild variant="outline" size="lg" className="mt-3 h-12 w-full rounded-full">
              <Link to="/cart">
                Checkout now <ArrowRight />
              </Link>
            </Button>
          )}

          <p className="mt-5 text-xs text-muted-foreground">
            Cleanse and tone morning and night, and finish with SPF every morning. Start treatment
            serums 2–3 nights a week and build up.
          </p>
        </aside>
      </div>
    </div>
  );
}
