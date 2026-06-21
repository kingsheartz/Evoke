export type ScrollJumpVariant = "site" | "admin";

export function getScrollStorageKey(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

export function scrollStorageKeyForPath(path: string): string {
  return `evoke-scroll:${path}`;
}

export function getAdminScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(".admin-main");
}

export function getScrollContainer(variant: ScrollJumpVariant): HTMLElement | null {
  return variant === "admin" ? getAdminScrollContainer() : null;
}

export function readScrollMetrics(container: HTMLElement | null) {
  if (container) {
    return {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
    };
  }

  return {
    scrollTop: window.scrollY,
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    clientHeight: window.innerHeight,
  };
}

export function scrollToTop(container: HTMLElement | null) {
  if (container) {
    container.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToBottom(container: HTMLElement | null) {
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    return;
  }
  const bottom = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  window.scrollTo({ top: bottom, behavior: "smooth" });
}
