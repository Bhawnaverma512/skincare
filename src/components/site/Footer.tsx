import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import { categories } from "@/lib/products";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Beauty <span className="italic text-primary">Glow</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {site.tagline}. Thoughtfully made, cruelty-free and kind to your skin.
          </p>
          <div className="mt-4 space-y-1.5 text-sm font-medium">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-primary">
              <Mail className="size-4 text-primary" />
              {site.email}
            </a>
            <a href={site.phoneHref} className="flex items-center gap-2 hover:text-primary">
              <Phone className="size-4 text-primary" />
              {site.phone}
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-foreground">
                All products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to="/shop"
                  search={{ category: category.name }}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Help</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" hash="faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" hash="faq" className="hover:text-foreground">
                Shipping & returns
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Your bag
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Cruelty-free · Fragrance-conscious · Recyclable packaging</p>
        </div>
      </div>
    </footer>
  );
}
