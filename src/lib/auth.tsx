import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AuthContext, type AuthContextValue } from "./auth-context";
import { getSupabase } from "./supabase";

/** Where Supabase sends people after they click the link in a confirmation email. */
function confirmationRedirectUrl(): string {
  return `${window.location.origin}/login`;
}

interface EmailLinkResult {
  type: string | null;
  error: string | null;
}

/**
 * Reads what Supabase put in the URL after an email link was clicked. Supabase
 * uses the hash for tokens and errors, but some errors arrive in the query string.
 * Must run before the client is created, because the client clears the hash.
 */
function readEmailLinkResult(): EmailLinkResult {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const get = (key: string) => hash.get(key) ?? query.get(key);
  const errorCode = get("error_code");
  const description = get("error_description");

  let error: string | null = null;
  if (errorCode === "otp_expired") {
    error = "This confirmation link is invalid or has expired.";
  } else if (description || get("error")) {
    error = description ?? "We couldn't confirm your email. Please try again.";
  }
  return { type: get("type"), error };
}

function clearEmailLinkParams() {
  const url = new URL(window.location.href);
  for (const key of ["error", "error_code", "error_description", "type", "code"]) {
    url.searchParams.delete(key);
  }
  url.hash = "";
  window.history.replaceState(window.history.state, "", url);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // The session is stored in the browser, so read it after the server render.
  useEffect(() => {
    const linkResult = readEmailLinkResult();
    const supabase = getSupabase();
    let active = true;

    if (linkResult.error) {
      setLinkError(linkResult.error);
      clearEmailLinkParams();
      // The login page shows this inline; elsewhere (e.g. Supabase fell back to the
      // Site URL) a toast is the only way the visitor would see it.
      if (window.location.pathname !== "/login") {
        toast.error(linkResult.error, {
          action: {
            label: "Get a new link",
            onClick: () => window.location.assign("/login#error_code=otp_expired"),
          },
        });
      }
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setReady(true);
      if (error) {
        setLinkError(error.message);
      } else if (data.session && linkResult.type === "signup") {
        toast.success("Your email is confirmed — you're logged in!");
      }
      if (linkResult.type) clearEmailLinkParams();
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });
    if (error) throw error;
    // With email confirmation on, Supabase returns a user with no identities when
    // the address is already registered (to avoid revealing which emails exist).
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists. Try logging in instead.");
    }
    return { needsConfirmation: !data.session };
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  const clearLinkError = useCallback(() => setLinkError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      linkError,
      clearLinkError,
      signIn,
      signUp,
      resendConfirmation,
      signOut,
    }),
    [user, ready, linkError, clearLinkError, signIn, signUp, resendConfirmation, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
