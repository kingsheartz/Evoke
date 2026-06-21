import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Delivery" },
  { id: 2, label: "Review" },
  { id: 3, label: "Confirm" },
] as const;

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {steps.map((step, index) => {
        const done = step.id < current;
        const active = step.id === current;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                done && "bg-status-success text-white",
                active && !done && "bg-accent text-white",
                !done && !active && "border border-app-border bg-app-surface text-app-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : step.id}
            </span>
            <span
              className={cn(
                "hidden truncate text-sm font-medium sm:block",
                active ? "text-app-text" : done ? "text-app-muted" : "text-app-muted/70",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "mx-1 hidden h-px flex-1 sm:block",
                  done ? "bg-status-success/60" : "bg-app-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
