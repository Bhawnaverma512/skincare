import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({ value, className }: { value: number; className?: string | undefined }) {
  const rounded = Math.round(value);
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            star <= rounded ? "fill-primary text-primary" : "fill-transparent text-input",
          )}
        />
      ))}
    </div>
  );
}
