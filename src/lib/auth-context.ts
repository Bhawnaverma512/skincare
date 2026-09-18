import type { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export interface SignUpResult {
  /** True when Supabase requires the user to confirm their email before signing in. */
  needsConfirmation: boolean;
}

export interface AuthContextValue {
  user: User | null;
  /** False until the saved session has been read from the browser. */
  ready: boolean;
  /** Problem reported by a confirmation link the user just opened (e.g. expired). */
  linkError: string | null;
  clearLinkError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  /** Sends the sign-up confirmation email again. */
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

function authErrorCode(error: unknown): string | undefined {
  return error instanceof Error ? (error as Error & { code?: string }).code : undefined;
}

/** Supabase's error when someone logs in before clicking their confirmation link. */
export function isEmailNotConfirmed(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    authErrorCode(error) === "email_not_confirmed" || /email not confirmed/i.test(error.message)
  );
}

/** Supabase's error for a wrong password or an email with no account. */
export function isInvalidCredentials(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    authErrorCode(error) === "invalid_credentials" ||
    /invalid login credentials/i.test(error.message)
  );
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials:
    "Email or password is incorrect — or there's no account for this email yet. Check your details, or create an account first.",
  email_address_not_authorized:
    "We couldn't send a confirmation email to this address. The store's email service isn't set up to send to it yet — please contact us, or try again later.",
  over_email_send_rate_limit:
    "Too many emails have been sent in a short time. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
  user_already_exists: "An account with this email already exists. Try logging in instead.",
  weak_password: "That password is too weak. Use at least 6 characters with letters and numbers.",
  email_address_invalid: "That email address isn't accepted. Please use a different one.",
  signup_disabled: "New sign-ups are currently turned off.",
  email_provider_disabled: "Email sign-in is currently turned off.",
};

/** Turns a Supabase auth error into a message a shopper can act on. */
export function authErrorMessage(error: unknown): string {
  const code = authErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (!(error instanceof Error)) return "Something went wrong. Please try again.";
  if (/error sending confirmation email/i.test(error.message)) {
    return "Your account couldn't be created because the confirmation email failed to send. Please try again later.";
  }
  if (error.name === "AuthRetryableFetchError" || /failed to fetch/i.test(error.message)) {
    return "Can't reach the sign-in service. Check your internet connection and try again.";
  }
  return error.message;
}
