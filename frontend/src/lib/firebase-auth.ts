import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, signInWithGoogleIdToken } from "@/lib/firebase-auth-core";

export { signInWithGoogleIdToken };

const EMAIL_LINK_STORAGE_KEY = "evoke-email-link-signin";

export function getEmailLinkContinueUrl(redirect?: string | null): string {
  const url = new URL(
    typeof window !== "undefined" ? `${window.location.origin}/sign-in/email-link` : "/sign-in/email-link",
  );
  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }
  return url.toString();
}

export async function sendPasswordlessSignInLink(email: string, redirect?: string | null): Promise<void> {
  const auth = getFirebaseAuth();
  await sendSignInLinkToEmail(auth, email.trim(), {
    url: getEmailLinkContinueUrl(redirect),
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email.trim());
}

export function isPasswordlessEmailLink(url: string): boolean {
  try {
    return isSignInWithEmailLink(getFirebaseAuth(), url);
  } catch {
    return false;
  }
}

export async function completePasswordlessSignInLink(email: string, url: string): Promise<string> {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailLink(auth, email.trim(), url);
  window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
  return credential.user.getIdToken();
}

export function getStoredPasswordlessEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
}

export async function signInWithEmailPasswordIdToken(email: string, password: string): Promise<string> {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user.getIdToken();
}

export async function registerWithEmailPasswordIdToken(
  name: string,
  email: string,
  password: string,
): Promise<string> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });

  try {
    await sendEmailVerification(credential.user);
  } catch {
    // Non-fatal — account is still created.
  }

  return credential.user.getIdToken(true);
}

export function isFirebaseAuthCredentialError(error: unknown): boolean {
  return (
    error instanceof FirebaseError &&
    ["auth/user-not-found", "auth/invalid-credential", "auth/wrong-password"].includes(error.code)
  );
}

export function mapFirebaseAuthError(error: unknown, fallback: string): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : fallback;
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/invalid-action-code":
      return "This sign-in link is invalid or has expired. Request a new one.";
    case "auth/expired-action-code":
      return "This sign-in link has expired. Request a new one.";
    default:
      return error.message || fallback;
  }
}
