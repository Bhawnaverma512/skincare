import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { shippingFor, useCart } from "@/lib/cart-context";
import {
  EXPRESS_FEE,
  placeOrder,
  type DeliveryMethod,
  type PlacedOrder,
  type ShippingDetails,
} from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Beauty Glow" }] }),
  component: CheckoutPage,
});

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:\+?91)?[6-9]\d{9}$/;
const PIN_PATTERN = /^[1-9]\d{5}$/;

type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

const emptyDetails: ShippingDetails = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

function validate(details: ShippingDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!EMAIL_PATTERN.test(details.email.trim())) errors.email = "Enter a valid email address.";
  if (details.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!PHONE_PATTERN.test(details.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter a valid 10-digit mobile number.";
  if (details.addressLine1.trim().length < 5)
    errors.addressLine1 = "Enter your house number and street.";
  if (!details.city.trim()) errors.city = "Enter your city.";
  if (!details.state) errors.state = "Choose your state.";
  if (!PIN_PATTERN.test(details.postalCode.trim())) errors.postalCode = "Enter a 6-digit PIN code.";
  return errors;
}

function trimDetails(details: ShippingDetails): ShippingDetails {
  return {
    ...details,
    email: details.email.trim(),
    fullName: details.fullName.trim(),
    phone: details.phone.replace(/[\s-]/g, ""),
    addressLine1: details.addressLine1.trim(),
    addressLine2: details.addressLine2.trim(),
    city: details.city.trim(),
    postalCode: details.postalCode.trim(),
  };
}

function CheckoutPage() {
  const { lines, count, subtotal, ready, clear } = useCart();
  const { user } = useAuth();
  const [details, setDetails] = useState<ShippingDetails>(emptyDetails);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Prefill the email for logged-in customers without overwriting what they typed.
  useEffect(() => {
    if (user?.email) {
      setDetails((prev) => (prev.email ? prev : { ...prev, email: user.email ?? "" }));
    }
  }, [user]);

  if (placed) return <OrderPlaced order={placed} />;
  if (!ready) return <div className="min-h-[50vh]" aria-busy="true" />;
  if (lines.length === 0) return <EmptyCheckout />;

  const baseShipping = shippingFor(subtotal);
  const shipping = baseShipping + (delivery === "express" ? EXPRESS_FEE : 0);
  const total = subtotal + shipping;

  function update(field: keyof ShippingDetails, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(details);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const order = await placeOrder({
        details: trimDetails(details),
        delivery,
        payment: "cod",
        lines,
        subtotal,
        shipping,
        total,
        userId: user?.id ?? null,
      });
      setPlaced(order);
      clear();
      window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (field: keyof ShippingDetails) => ({
    id: `checkout-${field}`,
    value: details[field],
    onChange: (event: { target: { value: string } }) => update(field, event.target.value),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `checkout-${field}-error` : undefined,
    className: "h-11",
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to bag
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]"
      >
        <div className="space-y-8">
          <FormSection title="Contact">
            {user ? (
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Checking out as a guest.{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>{" "}
                to link this order to your account.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field field="email" label="Email" error={errors.email}>
                <Input type="email" autoComplete="email" {...fieldProps("email")} />
              </Field>
              <Field field="phone" label="Mobile number" error={errors.phone}>
                <Input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="98765 43210"
                  {...fieldProps("phone")}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Shipping address">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field field="fullName" label="Full name" error={errors.fullName} wide>
                <Input autoComplete="name" {...fieldProps("fullName")} />
              </Field>
              <Field
                field="addressLine1"
                label="House no., street"
                error={errors.addressLine1}
                wide
              >
                <Input autoComplete="address-line1" {...fieldProps("addressLine1")} />
              </Field>
              <Field
                field="addressLine2"
                label="Area, landmark (optional)"
                error={errors.addressLine2}
                wide
              >
                <Input autoComplete="address-line2" {...fieldProps("addressLine2")} />
              </Field>
              <Field field="city" label="City" error={errors.city}>
                <Input autoComplete="address-level2" {...fieldProps("city")} />
              </Field>
              <Field field="postalCode" label="PIN code" error={errors.postalCode}>
                <Input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  {...fieldProps("postalCode")}
                />
              </Field>
              <Field field="state" label="State" error={errors.state} wide>
                <select
                  id="checkout-state"
                  autoComplete="address-level1"
                  value={details.state}
                  onChange={(event) => update("state", event.target.value)}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "checkout-state-error" : undefined}
                  className={cn(
                    "h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive",
                    !details.state && "text-muted-foreground",
                  )}
                >
                  <option value="" disabled>
                    Choose a state
                  </option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state} className="text-foreground">
                      {state}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">We currently deliver within India.</p>
          </FormSection>

          <FormSection title="Delivery">
            <div
              role="radiogroup"
              aria-label="Delivery method"
              className="grid gap-3 sm:grid-cols-2"
            >
              <OptionCard
                selected={delivery === "standard"}
                onSelect={() => setDelivery("standard")}
                icon={Truck}
                title="Standard"
                detail="3–5 business days"
                price={baseShipping === 0 ? "Free" : formatPrice(baseShipping)}
              />
              <OptionCard
                selected={delivery === "express"}
                onSelect={() => setDelivery("express")}
                icon={Zap}
                title="Express"
                detail="1–2 business days"
                price={formatPrice(baseShipping + EXPRESS_FEE)}
              />
            </div>
          </FormSection>

          <FormSection title="Payment">
            <div
              role="radiogroup"
              aria-label="Payment method"
              className="grid gap-3 sm:grid-cols-2"
            >
              <OptionCard
                selected
                onSelect={() => undefined}
                icon={Banknote}
                title="Cash on delivery"
                detail="Pay in cash or UPI when your order arrives"
              />
              <OptionCard
                selected={false}
                disabled
                onSelect={() => undefined}
                icon={CreditCard}
                title="Card / UPI online"
                detail="Coming soon"
              />
            </div>
          </FormSection>
        </div>

        <aside className="h-fit rounded-3xl bg-secondary/60 p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-2xl font-semibold">
            Order summary{" "}
            <span className="font-sans text-sm font-normal text-muted-foreground">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          </h2>

          <ul className="mt-5 space-y-4">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="relative w-14 shrink-0">
                  <ProductImage
                    shape={product.shape}
                    tint={product.tint}
                    backdrop={product.backdrop}
                    image={product.image}
                    alt={product.name}
                    className="rounded-xl"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                    {quantity}
                  </span>
                </div>
                <p className="min-w-0 flex-1 text-sm leading-snug">{product.name}</p>
                <p className="shrink-0 text-sm font-medium">
                  {formatPrice(product.price * quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Shipping ({delivery === "express" ? "express" : "standard"})
              </dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          {submitError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-6 h-12 w-full rounded-full"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Lock />}
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            You'll pay {formatPrice(total)} on delivery. Questions? Call {site.phone}.
          </p>
        </aside>
      </form>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = `checkout-section-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section
      aria-labelledby={headingId}
      className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
    >
      <h2 id={headingId} className="font-display text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  field,
  label,
  error,
  wide = false,
  children,
}: {
  field: keyof ShippingDetails;
  label: string;
  error: string | undefined;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", wide && "sm:col-span-2")}>
      <Label htmlFor={`checkout-${field}`}>{label}</Label>
      {children}
      {error && (
        <p id={`checkout-${field}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function OptionCard({
  selected,
  disabled = false,
  onSelect,
  icon: Icon,
  title,
  detail,
  price,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: typeof Truck;
  title: string;
  detail: string;
  price?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
        selected ? "border-primary bg-secondary/60" : "border-border/60",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-muted-foreground/40",
        )}
      >
        {selected && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-medium">
          <Icon className="size-4 text-primary" /> {title}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{detail}</span>
      </span>
      {price && <span className="shrink-0 text-sm font-medium">{price}</span>}
    </button>
  );
}

function EmptyCheckout() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <ShoppingBag className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Your bag is empty</h1>
      <p className="mt-3 text-muted-foreground">Add a few products before checking out.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild size="lg" className="h-12 rounded-full px-8">
          <Link to="/shop">Shop products</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
          <Link to="/skin-finder">Find my routine</Link>
        </Button>
      </div>
    </section>
  );
}

function OrderPlaced({ order }: { order: PlacedOrder }) {
  const [copied, setCopied] = useState(false);

  async function copyOrderNumber() {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success("Order number copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please write the number down.");
    }
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-24 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Thank you for your order!</h1>
      <p className="mt-3 text-muted-foreground">Your order has been placed.</p>
      <div className="mx-auto mt-6 max-w-sm rounded-3xl border-2 border-dashed border-primary/40 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Your order number
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-mono text-2xl font-semibold tracking-wider">
            {order.orderNumber}
          </span>
          <button
            type="button"
            onClick={copyOrderNumber}
            aria-label="Copy order number"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Save this number — you'll need it to track your order.
        </p>
      </div>
      <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-3xl bg-secondary/60 p-6 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Items</dt>
          <dd>{order.itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd>
            {order.delivery === "express" ? "Express, 1–2 days" : "Standard, 3–5 business days"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Payment</dt>
          <dd>Cash on delivery</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
          <dt>Amount to pay</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">
        Our team will reach out on your mobile or at{" "}
        <span className="text-foreground">{order.email}</span> to confirm delivery. Keep your order
        number handy if you call us on {site.phone}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild size="lg" className="h-12 rounded-full px-8">
          <Link to="/track" search={{ order: order.orderNumber }}>
            Track this order
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    </section>
  );
}
