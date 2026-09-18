import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, MessageSquareWarning, Star, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Rating } from "@/components/site/Rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@/lib/products";
import { deleteReview, listReviews, submitReview, type Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ProductReviews({ product }: { product: Product }) {
  const { user, ready } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    let active = true;
    setReviews(null);
    setLoadError(null);
    setWriting(false);
    listReviews(product.id)
      .then((list) => active && setReviews(list))
      .catch((err: Error) => active && setLoadError(err.message));
    return () => {
      active = false;
    };
  }, [product.id]);

  const ownReview = user ? reviews?.find((review) => review.userId === user.id) : undefined;
  const count = reviews?.length ?? 0;
  const average = count ? reviews!.reduce((sum, review) => sum + review.rating, 0) / count : 0;

  async function handleDelete(review: Review) {
    try {
      await deleteReview(review.id);
      setReviews((list) => list?.filter((item) => item.id !== review.id) ?? null);
      toast.success("Your review was deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete your review.");
    }
  }

  return (
    <section id="reviews" className="scroll-mt-32 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[18rem_1fr] md:py-20">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Customer reviews</h2>
          {count > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold">{average.toFixed(1)}</span>
                <div>
                  <Rating value={average} />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {count} {count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const n = reviews!.filter((review) => review.rating === stars).length;
                  return (
                    <li key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground">{stars}</span>
                      <Star className="size-3 fill-primary text-primary" aria-hidden="true" />
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${(n / count) * 100}%` }}
                        />
                      </span>
                      <span className="w-5 text-right text-muted-foreground">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {!ready ? null : !user ? (
              <p className="text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>{" "}
                to write a review.
              </p>
            ) : ownReview ? (
              <p className="text-sm text-muted-foreground">
                Thanks — you've reviewed this product.
              </p>
            ) : (
              !writing &&
              !loadError && (
                <Button className="w-full rounded-full" onClick={() => setWriting(true)}>
                  Write a review
                </Button>
              )
            )}
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link
                to="/contact"
                search={{ topic: "Problem with a product", product: product.name }}
              >
                <MessageSquareWarning /> Report a problem
              </Link>
            </Button>
          </div>
        </div>

        <div>
          {writing && user && (
            <ReviewForm
              product={product}
              defaultName={user.email?.split("@")[0] ?? ""}
              userId={user.id}
              onCancel={() => setWriting(false)}
              onPosted={(review) => {
                setReviews((list) => [review, ...(list ?? [])]);
                setWriting(false);
              }}
            />
          )}

          {loadError ? (
            <p className="flex gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {loadError}
            </p>
          ) : reviews === null ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : count === 0 ? (
            !writing && (
              <div className="rounded-3xl bg-secondary/60 p-8 text-center">
                <p className="font-medium">No reviews yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tried {product.name}? Be the first to share how it worked for you.
                </p>
              </div>
            )
          ) : (
            <ul className="divide-y divide-border">
              {reviews.map((review) => (
                <li key={review.id} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <Rating value={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(review.createdAt))}
                    </span>
                  </div>
                  {review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{review.authorName}</span>
                    {user?.id === review.userId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(review)}
                        className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  product,
  defaultName,
  userId,
  onCancel,
  onPosted,
}: {
  product: Product;
  defaultName: string;
  userId: string;
  onCancel: () => void;
  onPosted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    if (!name.trim()) return setError("Please enter the name to show with your review.");
    if (body.trim().length < 10) return setError("Please write at least 10 characters.");
    setError(null);
    setPosting(true);
    try {
      const review = await submitReview({
        productId: product.id,
        userId,
        authorName: name,
        rating,
        title,
        body,
      });
      toast.success("Thanks! Your review is live.");
      onPosted(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post your review.");
    } finally {
      setPosting(false);
    }
  }

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-8 space-y-4 rounded-3xl border border-border/60 bg-card p-6"
    >
      <h3 className="font-semibold">Review {product.name}</h3>
      <div>
        <p className="text-sm font-medium">Your rating</p>
        <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              className="cursor-pointer p-0.5"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  star <= shown ? "fill-primary text-primary" : "fill-transparent text-input",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{RATING_WORDS[shown]}</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-name">Display name</Label>
          <Input
            id="review-name"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-title">Title (optional)</Label>
          <Input
            id="review-title"
            value={title}
            maxLength={100}
            placeholder="Sum it up"
            onChange={(e) => setTitle(e.target.value)}
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          rows={4}
          maxLength={2000}
          value={body}
          placeholder="How did it work for your skin? How long have you used it?"
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="rounded-full px-6" disabled={posting}>
          {posting && <Loader2 className="animate-spin" />}
          Post review
        </Button>
        <Button type="button" variant="outline" className="rounded-full px-6" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
