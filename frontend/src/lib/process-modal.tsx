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
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProcessModalVariant = "danger" | "warning" | "info" | "success";

export type ProcessModalOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ProcessModalVariant;
};

type ProcessModalRequest = ProcessModalOptions & {
  resolve: (confirmed: boolean) => void;
};

type ProcessModalContextValue = {
  confirm: (options: ProcessModalOptions | string) => Promise<boolean>;
};

const ProcessModalContext = createContext<ProcessModalContextValue | null>(null);

const VARIANT_CONFIG: Record<
  ProcessModalVariant,
  {
    icon: LucideIcon;
    iconWrap: string;
    confirmButton: string;
    defaultTitle: string;
    defaultConfirm: string;
  }
> = {
  danger: {
    icon: AlertTriangle,
    iconWrap: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
    confirmButton:
      "border-transparent bg-[var(--color-error)] text-white hover:bg-red-500 focus-visible:ring-[var(--color-error)]/40",
    defaultTitle: "Are you sure?",
    defaultConfirm: "Delete",
  },
  warning: {
    icon: AlertCircle,
    iconWrap: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    confirmButton:
      "border-transparent bg-[var(--color-warning)] text-slate-950 hover:brightness-110 focus-visible:ring-[var(--color-warning)]/40",
    defaultTitle: "Are you sure?",
    defaultConfirm: "Continue",
  },
  info: {
    icon: Info,
    iconWrap: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
    confirmButton: "",
    defaultTitle: "Confirm action",
    defaultConfirm: "Confirm",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    confirmButton:
      "border-transparent bg-[var(--color-success)] text-slate-950 hover:brightness-110 focus-visible:ring-[var(--color-success)]/40",
    defaultTitle: "Proceed?",
    defaultConfirm: "Continue",
  },
};

function normalizeOptions(input: ProcessModalOptions | string): ProcessModalOptions {
  if (typeof input === "string") {
    return { description: input, variant: "danger" };
  }
  return input;
}

function ProcessModalDialog({
  request,
  onClose,
}: {
  request: ProcessModalRequest;
  onClose: () => void;
}) {
  const variant = request.variant ?? "danger";
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  const title = request.title ?? config.defaultTitle;
  const confirmLabel = request.confirmLabel ?? config.defaultConfirm;
  const cancelLabel = request.cancelLabel ?? "Cancel";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        request.resolve(false);
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [request, onClose]);

  return (
    <div
      className="fixed inset-0 z-2147483646 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="process-modal-title"
      aria-describedby="process-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          request.resolve(false);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[22rem] rounded-2xl border border-app-border bg-app-surface px-6 py-8 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
        <div
          className={cn(
            "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full",
            config.iconWrap,
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />
        </div>

        <h2 id="process-modal-title" className="font-display text-xl font-semibold tracking-tight text-app-text">
          {title}
        </h2>
        <p id="process-modal-description" className="mt-3 text-sm leading-relaxed text-app-muted">
          {request.description}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant={variant === "danger" ? "destructive" : "default"}
            className={cn(
              "h-11 w-full rounded-xl",
              (variant === "warning" || variant === "success") && config.confirmButton,
            )}
            onClick={() => {
              request.resolve(true);
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl"
            onClick={() => {
              request.resolve(false);
              onClose();
            }}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProcessModalProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ProcessModalRequest | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const confirm = useCallback((input: ProcessModalOptions | string) => {
    const options = normalizeOptions(input);
    return new Promise<boolean>((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  const close = useCallback(() => setRequest(null), []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ProcessModalContext.Provider value={value}>
      {children}
      {mounted &&
        request &&
        createPortal(<ProcessModalDialog request={request} onClose={close} />, document.body)}
    </ProcessModalContext.Provider>
  );
}

export function useProcessModal() {
  const ctx = useContext(ProcessModalContext);
  if (!ctx) {
    throw new Error("useProcessModal must be used within ProcessModalProvider");
  }
  return ctx;
}

/** Promise-based confirmation — drop-in replacement for `window.confirm`. */
export function useConfirm() {
  return useProcessModal().confirm;
}
