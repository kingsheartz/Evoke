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

export type NotificationVariant = "success" | "error" | "warning" | "info";

type NotificationItem = {
  id: string;
  message: string;
  variant: NotificationVariant;
  duration: number;
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

function ToastItem({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}) {
  const style = VARIANT_STYLES[item.variant];
  const Icon = style.icon;

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
        <p className="flex-1 text-sm leading-snug">{item.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-[3px] w-full bg-black/5">
        <div
          className="toast-progress h-full bg-current opacity-70"
          style={{ animationDuration: `${item.duration}ms` }}
          onAnimationEnd={() => onDismiss(item.id)}
        />
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((input: NotifyInput) => {
    const variant = input.variant ?? "info";
    const duration = input.duration ?? VARIANT_STYLES[variant].duration;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { id, message: input.message, variant, duration }]);
  }, []);

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

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed right-4 z-[99999] flex w-full max-w-[22rem] flex-col gap-2"
            style={{ top: "calc(var(--app-topbar-height) + 0.5rem)" }}
            aria-live="polite"
          >
            {items.map((item) => (
              <ToastItem key={item.id} item={item} onDismiss={dismiss} />
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
