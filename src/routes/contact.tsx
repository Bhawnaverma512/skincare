import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Headset, Loader2, Mail, Phone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { normalizeOrderNumber, ORDER_NUMBER_PATTERN } from "@/lib/orders";
import { sendCustomerMessage } from "@/lib/reviews";
import { faqs, site } from "@/lib/site";
import { cn } from "@/lib/utils";

interface ContactSearch {
  topic?: string;
  order?: string;
  product?: string;
}

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    const result: ContactSearch = {};
    for (const key of ["topic", "order", "product"] as const) {
      const value = search[key];
      if (typeof value === "string") result[key] = value;
    }
    return result;
  },
  head: () => ({
    meta: [
      { title: "Contact us — Beauty Glow" },
      {
        name: "description",
        content:
          "Questions about an order or your routine? Get in touch with the Beauty Glow team.",
      },
    ],
  }),
  component: ContactPage,
});

const topics = [
  "Problem with my order",
  "Problem with a product",
  "Order & shipping",
  "Product advice",
  "Returns",
  "Wholesale & press",
  "Something else",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormValues {
  name: string;
  email: string;
  topic: string;
  orderNumber: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string | undefined>>;

const emptyForm: FormValues = { name: "", email: "", topic: "", orderNumber: "", message: "" };

const isProblemTopic = (topic: string) => topic.startsWith("Problem");

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!values.topic) errors.topic = "Please choose a topic.";
  if (
    values.orderNumber.trim() &&
    !ORDER_NUMBER_PATTERN.test(normalizeOrderNumber(values.orderNumber))
  )
    errors.orderNumber = "Order numbers look like BG-7K4P-M2XD.";
  if (values.message.trim().length < 10)
    errors.message = "Please write a message of at least 10 characters.";
  return errors;
}

function ContactPage() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const [values, setValues] = useState<FormValues>(() => ({
    ...emptyForm,
    topic: search.topic && topics.includes(search.topic) ? search.topic : "",
    orderNumber: search.order ?? "",
    message: search.product ? `Product: ${search.product}\n\n` : "",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.email) setValues((prev) => (prev.email ? prev : { ...prev, email: user.email! }));
  }, [user]);

  function update(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSending(true);
    try {
      await sendCustomerMessage({ ...values, userId: user?.id ?? null });
      setSent(true);
      setValues(emptyForm);
      toast.success("Message sent! We'll get back to you within one business day.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="We're here to help" title="Contact us">
        Questions about an order, a product or building your routine? Send us a note and our team
        will reply within one business day.
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-10">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold">Thank you!</h2>
              <p className="mt-2 text-muted-foreground">
                Your message is on its way. We'll reply to your email within one business day.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => setSent(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
              <Field id="contact-name" label="Name" error={errors.name}>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className="h-11"
                />
              </Field>
              <Field id="contact-email" label="Email" error={errors.email}>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className="h-11"
                />
              </Field>
              <Field id="contact-topic" label="Topic" error={errors.topic}>
                <select
                  id="contact-topic"
                  value={values.topic}
                  onChange={(event) => update("topic", event.target.value)}
                  aria-invalid={Boolean(errors.topic)}
                  aria-describedby={errors.topic ? "contact-topic-error" : undefined}
                  className={cn(
                    "h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    !values.topic && "text-muted-foreground",
                  )}
                >
                  <option value="" disabled>
                    Choose a topic
                  </option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic} className="text-foreground">
                      {topic}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="contact-order"
                label={isProblemTopic(values.topic) ? "Order number" : "Order number (optional)"}
                error={errors.orderNumber}
              >
                <Input
                  id="contact-order"
                  placeholder="BG-7K4P-M2XD"
                  autoComplete="off"
                  value={values.orderNumber}
                  onChange={(event) => update("orderNumber", event.target.value)}
                  aria-invalid={Boolean(errors.orderNumber)}
                  aria-describedby={errors.orderNumber ? "contact-order-error" : undefined}
                  className="h-11 uppercase"
                />
              </Field>
              <Field
                id="contact-message"
                label="Message"
                error={errors.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="contact-message"
                  rows={6}
                  value={values.message}
                  onChange={(event) => update("message", event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  placeholder={
                    isProblemTopic(values.topic)
                      ? "What went wrong? e.g. damaged or missing item, wrong product, skin reaction, late delivery…"
                      : "How can we help?"
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={sending}
                  className="h-12 w-full rounded-full sm:w-auto sm:px-10"
                >
                  {sending && <Loader2 className="animate-spin" />}
                  Send message
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <InfoCard icon={Mail} title="Email us">
            <a href={`mailto:${site.email}`} className="hover:text-primary">
              {site.email}
            </a>
          </InfoCard>
          <InfoCard icon={Phone} title="Call us">
            <a href={site.phoneHref} className="hover:text-primary">
              {site.phone}
            </a>
          </InfoCard>
          <InfoCard icon={Headset} title="Voice agent (24/7)">
            <a href={site.voiceAgentPhoneHref} className="hover:text-primary">
              {site.voiceAgentPhone}
            </a>
          </InfoCard>
          <InfoCard icon={Clock} title="Support hours">
            {site.hours}
          </InfoCard>
        </aside>
      </section>

      <section id="faq" className="scroll-mt-32 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 rounded-3xl bg-background px-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="last:border-b-0">
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-secondary/60 p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
