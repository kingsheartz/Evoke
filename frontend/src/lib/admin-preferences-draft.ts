const DRAFT_KEY = "evoke-admin-preferences-draft";

export function readPreferencesDraft<T>(): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function savePreferencesDraft<T>(draft: T): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearPreferencesDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(DRAFT_KEY);
}
