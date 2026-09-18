import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Newsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success(
      "You're on the list! Look out for skincare tips and early access to new launches.",
    );
    setEmail("");
  }

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-4xl rounded-3xl bg-accent/60 px-6 py-12 text-center sm:px-12">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
          The Glow List
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          Get 10% off your first order
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Join our newsletter for simple routines, ingredient guides and first access to new
          products.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          noValidate
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-full bg-background px-5"
          />
          <Button type="submit" size="lg" className="h-11 rounded-full">
            Subscribe
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
