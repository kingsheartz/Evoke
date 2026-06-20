"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPreferencesStore, selectEffectiveNotifications, type NotificationPosition } from "@/stores/admin-preferences";

export type NotificationVariant = "success" | "error" | "warning" | "info";

type NotificationItem = {
  id: string;
  message: string;
  variant: NotificationVariant;
  duration: number;
  remainingMs: number;
};

type NotifyInput = {
  message: string;
  variant?: NotificationVariant;
  duration?: number;
  /** Show even when notifications are disabled (e.g. settings preview). */
  force?: boolean;
};

type NotificationContextValue = {
  notify: (input: NotifyInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  preview: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const VARIANT_STYLES: Record<
  NotificationVariant,
  { toastClass: string; icon: typeof CheckCircle2; duration: number }
> = {
  success: { toastClass: "notification-toast--success", icon: CheckCircle2, duration: 5000 },
  error: { toastClass: "notification-toast--error", icon: XCircle, duration: 8000 },
  warning: { toastClass: "notification-toast--warning", icon: AlertCircle, duration: 7000 },
  info: { toastClass: "notification-toast--info", icon: Info, duration: 5000 },
};

const POSITION_CLASSES: Record<NotificationPosition, string> = {
  "top-right": "right-4 top-[var(--notification-top)] items-end",
  "top-left": "left-4 top-[var(--notification-top)] items-start",
  "top-center": "left-1/2 top-[var(--notification-top)] -translate-x-1/2 items-center",
  /* Legacy bottom values — rendered at top (same horizontal alignment). */
  "bottom-right": "right-4 top-[var(--notification-top)] items-end",
  "bottom-left": "left-4 top-[var(--notification-top)] items-start",
  "bottom-center": "left-1/2 top-[var(--notification-top)] -translate-x-1/2 items-center",
};

function normalizePosition(position: NotificationPosition): NotificationPosition {
  if (position.startsWith("bottom")) {
    return position.replace("bottom", "top") as NotificationPosition;
  }
  return position;
}

function ToastItem({
  item,
  onDismiss,
  showProgressBar,
  showCountdown,
}: {
  item: NotificationItem;
  onDismiss: (id: string) => void;
  showProgressBar: boolean;
  showCountdown: boolean;
}) {
  const style = VARIANT_STYLES[item.variant];
  const Icon = style.icon;
  const [remaining, setRemaining] = useState(item.remainingMs);

  useEffect(() => {
    setRemaining(item.remainingMs);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, item.remainingMs - (Date.now() - started));
      setRemaining(left);
      if (left <= 0) window.clearInterval(tick);
    }, showCountdown ? 100 : 1000);
    return () => window.clearInterval(tick);
  }, [item.id, item.remainingMs, showCountdown]);

  return (
    <div
      role="status"
      className={cn(
        "notification-toast pointer-events-auto w-full max-w-[22rem] overflow-hidden",
        style.toastClass,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <p className="text-sm leading-snug">{item.message}</p>
          {showCountdown && (
            <p className="mt-1 text-[10px] font-mono opacity-70">{(remaining / 1000).toFixed(1)}s</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {showProgressBar && (
        <div className="h-[3px] w-full bg-app-border/60">
          <div
            className="toast-progress h-full bg-current opacity-70"
            style={{ animationDuration: `${item.duration}ms` }}
            onAnimationEnd={() => onDismiss(item.id)}
          />
        </div>
      )}
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const notifications = useAdminPreferencesStore(selectEffectiveNotifications);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotifyInput) => {
      const prefs = notificationsRef.current;
      if (!input.force && !prefs.enabled) return;
      const variant = input.variant ?? "info";
      const duration = input.duration ?? prefs.defaultDurationMs ?? VARIANT_STYLES[variant].duration;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setItems((prev) => [...prev, { id, message: input.message, variant, duration, remainingMs: duration }]);

      if (!prefs.showProgressBar) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (message) => notify({ message, variant: "success" }),
      error: (message) => notify({ message, variant: "error" }),
      warning: (message) => notify({ message, variant: "warning" }),
      info: (message) => notify({ message, variant: "info" }),
      preview: (message) => notify({ message, variant: "info", force: true }),
    }),
    [notify],
  );

  const position = normalizePosition(notifications.position ?? "top-center");

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "pointer-events-none fixed z-[var(--z-notification)] flex w-full max-w-[22rem] flex-col gap-2",
              POSITION_CLASSES[position],
            )}
            aria-live="polite"
          >
            {items.map((item) => (
              <ToastItem
                key={item.id}
                item={item}
                onDismiss={dismiss}
                showProgressBar={notifications.showProgressBar}
                showCountdown={notifications.showCountdown}
              />
            ))}
          </div>,
          document.body,
        )}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
