import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoading({
  label = "Loading...",
  fullScreen = false,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen
          ? "fixed inset-0 z-50 bg-app-bg"
          : "w-full min-h-[min(28rem,55vh)] py-16",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
      <p className="text-sm text-app-muted">{label}</p>
    </div>
  );
}
