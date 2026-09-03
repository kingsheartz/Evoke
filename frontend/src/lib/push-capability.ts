export type PushCapability =
  | "checking"
  | "ready"
  | "ios_install_required"
  | "denied"
  | "unsupported";

function isAppleMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }

  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function isStandaloneWebApp(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export async function detectPushCapability(): Promise<PushCapability> {
  if (typeof window === "undefined") {
    return "unsupported";
  }

  if (isAppleMobileDevice() && !isStandaloneWebApp()) {
    return "ios_install_required";
  }

  if (!("Notification" in window)) {
    return isAppleMobileDevice() ? "ios_install_required" : "unsupported";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const { isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) {
      return isAppleMobileDevice() ? "ios_install_required" : "unsupported";
    }
  } catch {
    return isAppleMobileDevice() ? "ios_install_required" : "unsupported";
  }

  return "ready";
}
