import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authErrorMessage,
  isEmailNotConfirmed,
  isInvalidCredentials,
  useAuth,
} from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Beauty Glow" },
      { name: "description", content: "Log in or create your Beauty Glow account." },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "signup";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
/** Supabase rate-limits confirmation emails, so wait before allowing another resend. */
const RESEND_COOLDOWN_SECONDS = 60;

function LoginPage() {
  const { user, ready, linkError, clearLinkError, signIn, signUp, resendConfirmation, signOut } =
    useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [suggestSignup, setSuggestSignup] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setUnconfirmedEmail(null);
    setSuggestSignup(false);
  }

  async function handleResend(address: string) {
    const trimmed = address.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter your email address above, then resend the confirmation link.");
      return;
    }
    setResending(true);
    try {
      await resendConfirmation(trimmed);
      setError(null);
      setUnconfirmedEmail(null);
      clearLinkError();
      setConfirmationSentTo(trimmed);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(`Confirmation email sent to ${trimmed}`);
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setError(null);
    setUnconfirmedEmail(null);
    setSuggestSignup(false);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(trimmedEmail, password);
        toast.success("Welcome back!");
        await navigate({ to: "/" });
      } else {
        const { needsConfirmation } = await signUp(trimmedEmail, password);
        if (needsConfirmation) {
          setConfirmationSentTo(trimmedEmail);
          setCooldown(RESEND_COOLDOWN_SECONDS);
        } else {
          toast.success("Your account is ready!");
          await navigate({ to: "/" });
        }
      }
      setPassword("");
    } catch (err) {
      if (isEmailNotConfirmed(err)) {
        setUnconfirmedEmail(trimmedEmail);
        setError(
          "Your email isn't confirmed yet. Click the link we emailed you, or send a new one.",
        );
      } else {
        setSuggestSignup(mode === "login" && isInvalidCredentials(err));
        setError(authErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("You've been logged out.");
    } catch (err) {
      toast.error(authErrorMessage(err));
    }
  }

  const title = mode === "login" ? "Log in" : "Create account";

  return (
    <>
      <PageHeader eyebrow="Your account" title={user ? "My account" : title}>
        {user
          ? "Manage your Beauty Glow session."
          : "Save your favourites and check out faster with a Beauty Glow account."}
      </PageHeader>

      <section className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-20">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-10">
          {!ready ? (
            <div className="flex justify-center py-10" aria-label="Loading">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold">You're logged in</h2>
              <p className="mt-2 break-all text-muted-foreground">{user.email}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button asChild className="rounded-full px-6">
                  <Link to="/shop">Continue shopping</Link>
                </Button>
                <Button variant="outline" className="rounded-full px-6" onClick={handleSignOut}>
                  Log out
                </Button>
              </div>
            </div>
          ) : confirmationSentTo ? (
            <div className="py-6 text-center">
              <MailCheck className="mx-auto size-12 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold">Check your email</h2>
              <p className="mt-2 text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="break-all font-medium text-foreground">{confirmationSentTo}</span>.
                Open it on this device to activate your account — you'll be logged in automatically.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Can't find it? Check your spam or promotions folder.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button
                  className="rounded-full px-6"
                  disabled={resending || cooldown > 0}
                  onClick={() => handleResend(confirmationSentTo)}
                >
                  {resending && <Loader2 className="size-4 animate-spin" />}
                  {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => {
                    setConfirmationSentTo(null);
                    switchMode("login");
                  }}
                >
                  Back to log in
                </Button>
              </div>
            </div>
          ) : (
            <>
              {linkError && (
                <div
                  role="alert"
                  className="mb-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-foreground">{linkError}</p>
                    <p className="mt-1 text-muted-foreground">
                      Enter your email below and choose “Resend confirmation email”.
                    </p>
                  </div>
                </div>
              )}

              <div
                role="tablist"
                aria-label="Account"
                className="grid grid-cols-2 rounded-full bg-secondary p-1"
              >
                {(["login", "signup"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={mode === tab}
                    onClick={() => switchMode(tab)}
                    className={cn(
                      "cursor-pointer rounded-full py-2 text-sm font-medium transition-colors",
                      mode === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "login" ? "Log in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground">
                      At least {MIN_PASSWORD_LENGTH} characters.
                    </p>
                  )}
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                {suggestSignup && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-full"
                    onClick={() => {
                      switchMode("signup");
                      setPassword("");
                    }}
                  >
                    New here? Create an account
                  </Button>
                )}

                {(unconfirmedEmail || linkError) && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-full"
                    disabled={resending || cooldown > 0}
                    onClick={() => handleResend(unconfirmedEmail ?? email)}
                  >
                    {resending && <Loader2 className="size-4 animate-spin" />}
                    {cooldown > 0
                      ? `Resend confirmation email in ${cooldown}s`
                      : "Resend confirmation email"}
                  </Button>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-12 w-full rounded-full"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {title}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
