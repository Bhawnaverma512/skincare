import { FREE_SHIPPING_THRESHOLD } from "./cart-context";
import { formatPrice } from "./products";

// Brand details shown across the site.
export const site = {
  name: "Beauty Glow",
  tagline: "Clean skincare for radiant, healthy-looking skin",
  email: "bhawnabhavu63@gmail.com",
  phone: "+91 90564 35237",
  phoneHref: "tel:+919056435237",
  // Automated voice agent — answers 24/7, separate line from the India number above.
  voiceAgentPhone: "+1 (302) 754 2049",
  voiceAgentPhoneHref: "tel:+13027542049",
  hours: "Mon–Fri, 9am–6pm",
};

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "How long does shipping take?",
    answer: `Orders ship within 1–2 business days. Standard delivery takes 3–5 business days, and shipping is free on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day happy-skin guarantee. If a product isn't right for you, contact us within 30 days of delivery — even if it's been opened — and we'll make it right.",
  },
  {
    question: "Are your products suitable for sensitive skin?",
    answer:
      "Our formulas are fragrance-free (except our rose toner, which uses natural rose water) and made without common irritants. If you have very reactive skin, we recommend a patch test before first use.",
  },
  {
    question: "Are Beauty Glow products cruelty-free?",
    answer:
      "Yes. We never test on animals, and we only work with suppliers who share that commitment.",
  },
  {
    question: "Where should I start if I'm new to skincare?",
    answer:
      "Keep it simple: a gentle cleanser, a moisturizer and daily SPF. Once that feels like a habit, add a serum that targets your main concern. Our team is happy to help you choose.",
  },
  {
    question: "Can I use glycolic acid and retinol together?",
    answer:
      "Use them on different nights — for example, Glycolic Glow Serum two or three evenings a week and retinol on the others — and wear SPF every morning. This keeps both effective and reduces the chance of irritation.",
  },
];
