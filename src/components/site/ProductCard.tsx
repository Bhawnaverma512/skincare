import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice, type Product } from "@/lib/products";

import { ProductImage } from "./ProductImage";
import { Rating } from "./Rating";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group flex flex-col">
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="relative block overflow-hidden rounded-2xl"
      >
        <ProductImage
          shape={product.shape}
          tint={product.tint}
          backdrop={product.backdrop}
          image={product.image}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-snug">
          <Link
            to="/products/$productId"
            params={{ productId: product.id }}
            className="hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Rating value={product.rating} />
          <span>
            {product.rating} ({product.reviewCount.toLocaleString("en-IN")})
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-medium">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              add(product.id);
              toast.success(`${product.name} added to your bag`);
            }}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}
