import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, isCategory, products, type Category } from "@/lib/products";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];

interface ShopSearch {
  category?: Category | undefined;
  sort?: SortKey | undefined;
}

function isSortKey(value: unknown): value is SortKey {
  return sortOptions.some((option) => option.value === value);
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const category = search["category"];
    const sort = search["sort"];
    return {
      ...(typeof category === "string" && isCategory(category) ? { category } : {}),
      ...(isSortKey(sort) ? { sort } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Shop skincare — Beauty Glow" },
      {
        name: "description",
        content:
          "Shop Beauty Glow cleansers, toners, serums, moisturizers, sunscreen and eye care.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, sort = "featured" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (category && product.category !== category) return false;
      if (!term) return true;
      return [
        product.name,
        product.tagline,
        product.category,
        ...product.ingredients.map((i) => i.name),
      ].some((text) => text.toLowerCase().includes(term));
    });

    switch (sort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "rating":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [category, sort, query]);

  function updateSearch(patch: ShopSearch) {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  }

  function resetFilters() {
    setQuery("");
    updateSearch({ category: undefined, sort: undefined });
  }

  return (
    <>
      <PageHeader eyebrow="The collection" title={category ?? "Shop all skincare"}>
        {category
          ? categories.find((c) => c.name === category)?.description
          : "Gentle, effective formulas for every step of your routine."}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div
              className="flex w-max gap-2 sm:w-auto sm:flex-wrap"
              role="group"
              aria-label="Filter by category"
            >
              <FilterChip active={!category} onClick={() => updateSearch({ category: undefined })}>
                All
              </FilterChip>
              {categories.map((c) => (
                <FilterChip
                  key={c.name}
                  active={category === c.name}
                  onClick={() => updateSearch({ category: c.name })}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products or ingredients"
                aria-label="Search products"
                className="h-10 rounded-full pl-10 sm:w-64"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sort by
              <select
                value={sort}
                onChange={(event) => {
                  const value = event.target.value;
                  if (isSortKey(value))
                    updateSearch({ sort: value === "featured" ? undefined : value });
                }}
                className="h-10 flex-1 cursor-pointer rounded-full border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:flex-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold">No products found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search term or clear your filters.
            </p>
            <Button variant="outline" className="mt-6 rounded-full" onClick={resetFilters}>
              <X /> Clear filters
            </Button>
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 cursor-pointer whitespace-nowrap rounded-full border px-4 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
