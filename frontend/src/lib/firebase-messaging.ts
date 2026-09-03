import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from "firebase/messaging";
import { apiClient } from "@/lib/api";
import { getFirebaseWebConfig, isFirebaseConfigured, type FirebaseWebConfig } from "@/lib/firebase-config";

const PUSH_TOKEN_STORAGE_KEY = "evoke-fcm-token";

let messagingPromise: Promise<Messaging | null> | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!isFirebaseConfigured() || typeof window === "undefined") {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = (async () => {
      const config = getFirebaseWebConfig();
      if (!config) {
        return null;
      }

      const app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
      return getMessaging(app);
    })();
  }

  return messagingPromise;
}

async function registerServiceWorker(config: FirebaseWebConfig): Promise<ServiceWorkerRegistration> {
  const params = new URLSearchParams({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });

  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`);
}

export function getStoredPushToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

function storePushToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
}

async function obtainFcmToken(): Promise<string | null> {
  const config = getFirebaseWebConfig();
  if (!config) {
    return null;
  }

  const registration = await registerServiceWorker(config);
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return null;
  }

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
}

export async function requestPushToken(authToken: string): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const token = await obtainFcmToken();
  if (!token) {
    return null;
  }

  await apiClient.registerDeviceToken(authToken, { token, platform: "web" });
  storePushToken(token);
  return token;
}

export async function syncPushTokenIfGranted(authToken: string): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  if (Notification.permission !== "granted") {
    return null;
  }

  const token = await obtainFcmToken();
  if (!token) {
    return null;
  }

  await apiClient.registerDeviceToken(authToken, { token, platform: "web" });
  storePushToken(token);
  return token;
}

export async function unregisterPushToken(authToken: string): Promise<void> {
  const token = getStoredPushToken();
  if (token) {
    await apiClient.deleteDeviceToken(authToken, token);
  }
  storePushToken(null);
}

export async function subscribeForegroundMessages(
  onPayload: (title: string, body: string) => void,
): Promise<(() => void) | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, (payload) => {
    onPayload(payload.notification?.title ?? "Evoke", payload.notification?.body ?? "");
  });
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}
