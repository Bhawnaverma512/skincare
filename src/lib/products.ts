export type Category = "Cleansers" | "Toners" | "Serums" | "Moisturizers" | "Sun Care" | "Eye Care";

export type BottleShape = "dropper" | "pump" | "bottle" | "jar" | "tube";

export interface Ingredient {
  name: string;
  benefit: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  price: number;
  size: string;
  rating: number;
  reviewCount: number;
  /** How long the product stays good unopened, counted from the manufacturing date. */
  shelfLifeMonths: number;
  /** Period after opening (PAO): use within this many months once opened. */
  afterOpeningMonths: number;
  /** Product photo in /public/images. Products without one use the drawn illustration. */
  image?: string;
  shape: BottleShape;
  /** Packaging color used by the product illustration. */
  tint: string;
  /** Background behind the product visual; matches the photo's edges when there is one. */
  backdrop: string;
  skinTypes: string[];
  description: string;
  benefits: string[];
  ingredients: Ingredient[];
  howToUse: string;
  bestseller: boolean;
  badge?: string;
}

export interface CategoryInfo {
  name: Category;
  description: string;
  image?: string;
  shape: BottleShape;
  tint: string;
  backdrop: string;
}

export const categories: CategoryInfo[] = [
  {
    name: "Cleansers",
    description: "Gentle, non-stripping washes",
    image: "/images/cleansing-milk.jpg",
    shape: "tube",
    tint: "#e7ebe1",
    backdrop: "#ffffff",
  },
  {
    name: "Toners",
    description: "Balance and prep",
    image: "/images/balancing-toner.jpg",
    shape: "bottle",
    tint: "#f0c9c4",
    backdrop: "#ffffff",
  },
  {
    name: "Serums",
    description: "Targeted treatments",
    image: "/images/glycolic-glow-serum.jpg",
    shape: "dropper",
    tint: "#f3d9c4",
    backdrop: "#f3ddd0",
  },
  {
    name: "Moisturizers",
    description: "Lasting hydration",
    image: "/images/moisturiser.jpg",
    shape: "jar",
    tint: "#f2c9c6",
    backdrop: "#f3e2d4",
  },
  {
    name: "Sun Care",
    description: "Everyday protection",
    image: "/images/tinted-sunscreen-spf-50.jpg",
    shape: "tube",
    tint: "#f6d8bd",
    backdrop: "#fde0c6",
  },
  {
    name: "Eye Care",
    description: "Smooth and renew",
    image: "/images/retinol-undereye-serum-creme.jpg",
    shape: "tube",
    tint: "#b9a3d6",
    backdrop: "#ffffff",
  },
];

export const products: Product[] = [
  {
    id: "glycolic-glow-serum",
    name: "Glycolic Glow Serum",
    tagline: "Smooth, brighten & even tone",
    category: "Serums",
    price: 599,
    size: "30 ml",
    rating: 4.8,
    reviewCount: 1284,
    shelfLifeMonths: 24,
    afterOpeningMonths: 6,
    image: "/images/glycolic-glow-serum.jpg",
    shape: "dropper",
    tint: "#f3d9c4",
    backdrop: "#f3ddd0",
    skinTypes: ["Oily", "Normal", "Combination", "Dullness", "Uneven texture"],
    description:
      "A silky serum with 5% glycolic acid and niacinamide that gently resurfaces dull skin. It helps smooth rough texture, brighten skin tone and even out the look of uneven patches, while keeping skin hydrated and nourished.",
    benefits: [
      "Brightens skin tone",
      "Smooths skin texture",
      "Hydrates & nourishes",
      "Helps even out the look of uneven tone",
    ],
    ingredients: [
      {
        name: "5% Glycolic Acid",
        benefit: "An AHA that gently exfoliates for smoother, brighter-looking skin.",
      },
      {
        name: "Niacinamide",
        benefit: "Helps even out skin tone and refine the look of pores.",
      },
      { name: "Glycerin", benefit: "Keeps skin hydrated and comfortable." },
    ],
    howToUse:
      "Use in the evening. After cleansing, apply 3–4 drops to face and neck, avoiding the eye area. Start 2–3 nights a week, follow with moisturiser, and always wear SPF the next day.",
    bestseller: true,
    badge: "Bestseller",
  },
  {
    id: "hyaluronic-acid-hydrating-serum",
    name: "Hyaluronic Acid Hydrating Serum",
    tagline: "Plumps & locks in moisture",
    category: "Serums",
    price: 549,
    size: "30 ml",
    rating: 4.9,
    reviewCount: 2110,
    shelfLifeMonths: 24,
    afterOpeningMonths: 12,
    image: "/images/hyaluronic-acid-hydrating-serum.jpg",
    shape: "dropper",
    tint: "#bcd5e3",
    backdrop: "#fafcf9",
    skinTypes: ["Oily", "Normal", "Combination", "Dry", "Dehydrated"],
    description:
      "Three weights of hyaluronic acid work at different layers of the skin's surface to draw in and hold moisture. Skin looks smoother, bouncier and more supple from the very first use.",
    benefits: [
      "Instantly quenches thirsty skin",
      "Smooths the look of fine, dry lines",
      "Weightless, non-sticky texture",
      "Suitable morning and night",
    ],
    ingredients: [
      {
        name: "Hyaluronic Acid Complex",
        benefit: "Three molecular weights for layered hydration.",
      },
      {
        name: "Panthenol (Vitamin B5)",
        benefit: "Soothes and supports a healthy moisture barrier.",
      },
      { name: "Glycerin", benefit: "A proven humectant that keeps skin soft." },
    ],
    howToUse:
      "Apply 2–3 drops to slightly damp skin morning and evening, then seal in with your moisturiser.",
    bestseller: true,
    badge: "Most loved",
  },
  {
    id: "face-wash",
    name: "Face Wash",
    tagline: "Gentle cleanse that refreshes skin",
    category: "Cleansers",
    price: 299,
    size: "100 g",
    rating: 4.7,
    reviewCount: 956,
    shelfLifeMonths: 36,
    afterOpeningMonths: 12,
    image: "/images/face-wash.jpg",
    shape: "tube",
    tint: "#e7ebe1",
    backdrop: "#ffffff",
    skinTypes: ["Oily", "Normal", "Combination", "Sensitive"],
    description:
      "A gentle daily face wash with green tea extract that lifts away dirt, oil and makeup without stripping. Skin feels clean, refreshed and comfortable — never tight.",
    benefits: [
      "Gentle, non-stripping cleanse",
      "Refreshes tired-looking skin",
      "Removes dirt, oil and makeup",
      "Suitable for daily use",
    ],
    ingredients: [
      { name: "Green Tea Extract", benefit: "Antioxidant-rich and refreshing for the skin." },
      { name: "Glycerin", benefit: "Keeps skin hydrated while you cleanse." },
      { name: "Ceramide NP", benefit: "Helps protect the skin's moisture barrier." },
    ],
    howToUse:
      "Work a small amount into a lather with water, massage onto damp skin for 30–60 seconds, then rinse. Use morning and night.",
    bestseller: false,
  },
  {
    id: "rose-balancing-toner",
    name: "Rose Water Balancing Toner",
    tagline: "Soothes and preps in one step",
    category: "Toners",
    price: 349,
    size: "200 ml",
    rating: 4.6,
    reviewCount: 612,
    shelfLifeMonths: 24,
    afterOpeningMonths: 12,
    image: "/images/balancing-toner.jpg",
    shape: "bottle",
    tint: "#f0c9c4",
    backdrop: "#ffffff",
    skinTypes: ["Oily", "Normal", "Combination", "Sensitive"],
    description:
      "An alcohol-free toner with real rose water that refreshes skin after cleansing and helps the rest of your routine absorb better. A calming ritual morning and night.",
    benefits: [
      "Alcohol-free and gentle",
      "Refreshes and softens after cleansing",
      "Preps skin for serums",
      "Delicate natural rose scent",
    ],
    ingredients: [
      { name: "Rose Water", benefit: "Soothes and refreshes the skin." },
      { name: "Allantoin", benefit: "Helps calm the look of redness." },
      { name: "Beta-Glucan", benefit: "Supports hydration and comfort." },
    ],
    howToUse:
      "After cleansing, sweep over face and neck with a cotton pad or pat directly into skin with your palms.",
    bestseller: false,
  },
  {
    id: "moisturiser",
    name: "Moisturiser",
    tagline: "Hydrates & nourishes for soft, supple skin",
    category: "Moisturizers",
    price: 449,
    size: "50 g",
    rating: 4.8,
    reviewCount: 1540,
    shelfLifeMonths: 24,
    afterOpeningMonths: 12,
    image: "/images/moisturiser.jpg",
    shape: "jar",
    tint: "#f2c9c6",
    backdrop: "#f3e2d4",
    skinTypes: ["Normal", "Combination", "Dry"],
    description:
      "An everyday cream enriched with vitamin E and natural extracts. It deeply hydrates, improves the feel of skin texture and leaves skin soft, supple and comfortable all day.",
    benefits: [
      "Deeply hydrates",
      "Improves skin texture",
      "Enriched with vitamin E",
      "Suitable for all skin types",
    ],
    ingredients: [
      {
        name: "Vitamin E",
        benefit: "An antioxidant that nourishes and helps protect against dryness.",
      },
      { name: "Natural Extracts", benefit: "Botanical extracts that soothe and soften skin." },
      { name: "Glycerin", benefit: "Draws in moisture for lasting hydration." },
    ],
    howToUse:
      "Warm a pea-sized amount between your fingertips and press into face and neck as the last step of your routine, morning and night.",
    bestseller: true,
  },
  {
    id: "retinol-night-serum",
    name: "Retinol Night Serum",
    tagline: "Smooths fine lines & improves texture",
    category: "Serums",
    price: 799,
    size: "30 ml",
    rating: 4.7,
    reviewCount: 734,
    shelfLifeMonths: 18,
    afterOpeningMonths: 6,
    shape: "dropper",
    tint: "#9d86c7",
    backdrop: "#f1edf7",
    skinTypes: ["Normal", "Combination", "Fine lines"],
    description:
      "A night serum with encapsulated retinol that releases gradually while you sleep, helping to smooth the look of fine lines and refine uneven texture, with peptides and squalane to keep skin comfortable.",
    benefits: [
      "Smooths the look of fine lines",
      "Refines uneven texture",
      "Slow-release for less irritation",
      "Lightweight overnight serum",
    ],
    ingredients: [
      {
        name: "Encapsulated Retinol",
        benefit: "Time-released renewal with less sensitivity.",
      },
      { name: "Peptides", benefit: "Help skin look firmer and smoother." },
      { name: "Squalane", benefit: "Lightweight moisture that keeps skin comfortable." },
    ],
    howToUse:
      "Use in the evening only. Start 2–3 nights a week and build up. Apply 2–3 drops after cleansing, then moisturise. Always wear SPF the next day.",
    bestseller: false,
    badge: "New",
  },
  {
    id: "tinted-sunscreen-spf-50",
    name: "Tinted Sunscreen SPF 50 PA+++",
    tagline: "Lightweight, non-greasy protection with a natural glow",
    category: "Sun Care",
    price: 399,
    size: "50 g",
    rating: 4.8,
    reviewCount: 1873,
    shelfLifeMonths: 24,
    afterOpeningMonths: 12,
    image: "/images/tinted-sunscreen-spf-50.jpg",
    shape: "tube",
    tint: "#f6d8bd",
    backdrop: "#fde0c6",
    skinTypes: ["Oily", "Normal", "Combination", "Everyday use"],
    description:
      "A lightweight, non-greasy tinted sunscreen with broad-spectrum SPF 50 PA+++ protection. A sheer tint helps even out skin tone for a natural glow, so it doubles as a light base on busy mornings.",
    benefits: [
      "Broad-spectrum UVA/UVB protection",
      "Lightweight & non-greasy",
      "Evens skin tone with a natural glow",
      "Suitable for all skin types",
    ],
    ingredients: [
      {
        name: "Broad-Spectrum UV Filters",
        benefit: "SPF 50 PA+++ protection against UVA and UVB rays.",
      },
      { name: "Sheer Tint", benefit: "Evens out skin tone for a natural finish." },
      { name: "Vitamin E", benefit: "Antioxidant support against daily stressors." },
    ],
    howToUse:
      "Apply generously as the last step of your morning routine, 15 minutes before sun exposure. Reapply at least every 2 hours.",
    bestseller: true,
  },
  {
    id: "retinol-undereye-serum-creme",
    name: "Retinol Advanced Renewal Undereye Serum Crème",
    tagline: "1% pro-retinol peptide complex for the delicate eye area",
    category: "Eye Care",
    price: 499,
    size: "15 g",
    rating: 4.5,
    reviewCount: 488,
    shelfLifeMonths: 24,
    afterOpeningMonths: 6,
    image: "/images/retinol-undereye-serum-creme.jpg",
    shape: "tube",
    tint: "#b9a3d6",
    backdrop: "#ffffff",
    skinTypes: ["All skin types", "Fine lines", "Tired-looking eyes"],
    description:
      "A lightweight serum-crème made for the under-eye area. Its 1% pro-retinol peptide complex helps smooth the look of fine lines and renew tired-looking skin, with a silky texture that absorbs quickly.",
    benefits: [
      "Smooths the look of fine lines",
      "Renews tired-looking skin",
      "Serum-light, crème-rich texture",
      "Gentle on the delicate eye area",
    ],
    ingredients: [
      {
        name: "1% Pro-Retinol Peptide Complex",
        benefit: "A gentle retinol and peptide blend that smooths and renews.",
      },
      { name: "Glycerin", benefit: "Keeps the delicate eye area hydrated." },
    ],
    howToUse:
      "Use in the evening. Tap a rice-grain amount under and around the eye area with your ring finger. Start every other night, and wear SPF during the day.",
    bestseller: false,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function requireProduct(id: string): Product {
  const product = getProduct(id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}

export function isCategory(value: string): value is Category {
  return categories.some((category) => category.name === value);
}

export const totalReviewCount = products.reduce((sum, product) => sum + product.reviewCount, 0);

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
