import { requireProduct, type Product } from "./products";

export type SkinType = "oily" | "normal" | "combination";
export type Concern = "breakouts" | "dullness" | "dehydration" | "fine-lines";

export interface SkinTypeInfo {
  id: SkinType;
  label: string;
  /** How the skin usually feels, so shoppers can recognise their type. */
  signs: string;
  summary: string;
}

export interface ConcernInfo {
  id: Concern;
  label: string;
}

export interface RoutineStep {
  step: string;
  product: Product;
  why: string;
  /** Part of the core routine, or an extra added for the chosen concern. */
  kind: "core" | "concern";
}

export const skinTypes: SkinTypeInfo[] = [
  {
    id: "oily",
    label: "Oily",
    signs: "Shiny all over by midday, visible pores, prone to breakouts.",
    summary:
      "Light, oil-free layers that control shine and keep pores clear — without stripping skin.",
  },
  {
    id: "normal",
    label: "Normal",
    signs: "Feels comfortable most of the day — rarely too oily or too tight.",
    summary: "A balanced routine that keeps skin hydrated, even-toned and protected.",
  },
  {
    id: "combination",
    label: "Combination",
    signs: "Oily T-zone (forehead, nose, chin) with normal or dry cheeks.",
    summary: "Clarify the T-zone and hydrate the drier areas, so your whole face feels balanced.",
  },
];

export const concerns: ConcernInfo[] = [
  { id: "breakouts", label: "Breakouts & pores" },
  { id: "dullness", label: "Dullness & uneven tone" },
  { id: "dehydration", label: "Dehydration" },
  { id: "fine-lines", label: "Fine lines" },
];

type StepSpec = [step: string, productId: string, why: string];

const routines: Record<SkinType, StepSpec[]> = {
  oily: [
    [
      "Cleanse",
      "face-wash",
      "Lifts away excess oil and makeup without leaving skin tight, which can trigger more oil.",
    ],
    ["Tone", "rose-balancing-toner", "Alcohol-free toner that refreshes and preps skin."],
    [
      "Treat",
      "glycolic-glow-serum",
      "5% glycolic acid and niacinamide smooth texture and help keep pores looking refined.",
    ],
    [
      "Hydrate",
      "hyaluronic-acid-hydrating-serum",
      "Weightless, oil-free hydration — oily skin still needs water, just not heavy creams.",
    ],
    ["Protect", "tinted-sunscreen-spf-50", "Lightweight, non-greasy SPF 50 that won't add shine."],
  ],
  normal: [
    ["Cleanse", "face-wash", "A gentle daily wash that keeps your skin's natural balance."],
    ["Tone", "rose-balancing-toner", "Refreshes after cleansing and helps serums absorb."],
    [
      "Hydrate",
      "hyaluronic-acid-hydrating-serum",
      "Layered hydration for a smooth, plump-looking finish.",
    ],
    ["Moisturise", "moisturiser", "Vitamin E cream that locks in moisture all day."],
    ["Protect", "tinted-sunscreen-spf-50", "Everyday broad-spectrum SPF 50 with a natural glow."],
  ],
  combination: [
    ["Cleanse", "face-wash", "Cleans the oily T-zone without drying out your cheeks."],
    ["Tone", "rose-balancing-toner", "Balances and refreshes every part of your face."],
    [
      "Treat",
      "glycolic-glow-serum",
      "Use on the T-zone to smooth texture and keep pores looking clear.",
    ],
    [
      "Moisturise",
      "moisturiser",
      "Press a thin layer onto drier cheeks; a little goes a long way on the T-zone.",
    ],
    ["Protect", "tinted-sunscreen-spf-50", "Non-greasy SPF 50 that suits both oily and dry areas."],
  ],
};

const concernPicks: Record<Concern, StepSpec> = {
  breakouts: [
    "Treat",
    "glycolic-glow-serum",
    "Gentle exfoliation helps keep pores clear and smooths bumpy texture.",
  ],
  dullness: [
    "Treat",
    "glycolic-glow-serum",
    "Brightens dull skin and helps even out the look of uneven tone.",
  ],
  dehydration: [
    "Hydrate",
    "hyaluronic-acid-hydrating-serum",
    "Three types of hyaluronic acid draw in and hold moisture.",
  ],
  "fine-lines": [
    "Night treatment",
    "retinol-night-serum",
    "Slow-release retinol smooths the look of fine lines while you sleep.",
  ],
};

export function isSkinType(value: unknown): value is SkinType {
  return skinTypes.some((type) => type.id === value);
}

export function isConcern(value: unknown): value is Concern {
  return concerns.some((concern) => concern.id === value);
}

export function getSkinType(id: SkinType): SkinTypeInfo {
  return skinTypes.find((type) => type.id === id) ?? skinTypes[0]!;
}

/** The recommended routine for a skin type, with an extra product for the concern if needed. */
export function buildRoutine(skinType: SkinType, concern?: Concern): RoutineStep[] {
  const steps: RoutineStep[] = routines[skinType].map(([step, productId, why]) => ({
    step,
    product: requireProduct(productId),
    why,
    kind: "core",
  }));

  if (concern) {
    const [step, productId, why] = concernPicks[concern];
    if (!steps.some((existing) => existing.product.id === productId)) {
      steps.push({ step, product: requireProduct(productId), why, kind: "concern" });
    }
  }
  return steps;
}

/** The product in a routine that targets the chosen concern, if any. */
export function concernProductId(concern: Concern | undefined): string | undefined {
  return concern ? concernPicks[concern][1] : undefined;
}
