"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPreferencesStore, type NotificationPosition } from "@/stores/admin-preferences";

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
};

type NotificationContextValue = {
  notify: (input: NotifyInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const VARIANT_STYLES: Record<
  NotificationVariant,
  { bg: string; icon: typeof CheckCircle2; duration: number }
> = {
  success: { bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", icon: CheckCircle2, duration: 5000 },
  error: { bg: "bg-red-500/10 text-red-300 border-red-500/30", icon: XCircle, duration: 8000 },
  warning: { bg: "bg-amber-500/10 text-amber-300 border-amber-500/30", icon: AlertCircle, duration: 7000 },
  info: { bg: "bg-blue-500/10 text-blue-300 border-blue-500/30", icon: Info, duration: 5000 },
};

const POSITION_CLASSES: Record<NotificationPosition, string> = {
  "top-right": "right-4 items-end",
  "top-left": "left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "top-center": "left-1/2 top-4 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

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
        "pointer-events-auto w-full max-w-[22rem] overflow-hidden rounded-xl border bg-app-surface shadow-2xl shadow-black/40",
        style.bg,
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
        <div className="h-[3px] w-full bg-black/5">
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
  const notifications = useAdminPreferencesStore((s) => s.notifications);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotifyInput) => {
      if (!notifications.enabled) return;
      const variant = input.variant ?? "info";
      const duration = input.duration ?? notifications.defaultDurationMs ?? VARIANT_STYLES[variant].duration;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setItems((prev) => [...prev, { id, message: input.message, variant, duration, remainingMs: duration }]);

      if (!notifications.showProgressBar) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss, notifications.defaultDurationMs, notifications.enabled, notifications.showProgressBar],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (message) => notify({ message, variant: "success" }),
      error: (message) => notify({ message, variant: "error" }),
      warning: (message) => notify({ message, variant: "warning" }),
      info: (message) => notify({ message, variant: "info" }),
    }),
    [notify],
  );

  const position = notifications.position ?? "top-right";
  const isTop = position.startsWith("top");

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "pointer-events-none fixed z-[99999] flex w-full max-w-[22rem] flex-col gap-2",
              POSITION_CLASSES[position],
            )}
            style={isTop ? { top: "calc(var(--app-topbar-height) + 0.5rem)" } : undefined}
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
