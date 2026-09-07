import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from "firebase/auth";
import { getFirebaseWebConfig, isFirebaseAuthConfigured } from "@/lib/firebase-config";

let authPromise: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!isFirebaseAuthConfigured()) {
    throw new Error("Firebase Auth is not configured for this environment.");
  }

  if (authPromise) {
    return authPromise;
  }

  const config = getFirebaseWebConfig();
  if (!config) {
    throw new Error("Firebase Auth is not configured for this environment.");
  }

  const app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  authPromise = getAuth(app);

  return authPromise;
}

export async function signInWithGoogleIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);

  return result.user.getIdToken();
}
