import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CmsButtonItem } from "@/lib/cms-sections";
import { textFormatClassName } from "@/lib/text-format";
import { cn } from "@/lib/utils";
export function CmsCtaButton({
  item,
  className,
  showArrow = true,
  context = "default",
}: {
  item: CmsButtonItem;
  className?: string;
  showArrow?: boolean;
  context?: "hero" | "default";
}) {
  const label = item.label?.trim();
  const url = item.url?.trim();
  if (!label || !url) return null;

  const variant = item.variant ?? "primary";
  const isExternal = /^https?:\/\//i.test(url);

  return (
    <Link
      href={url}
      target={item.new_tab || isExternal ? "_blank" : undefined}
      rel={item.new_tab || isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors",
        textFormatClassName(item.label_format),
        variant === "primary" && "bg-accent text-white hover:bg-accent-hover",        variant === "outline" &&
          (context === "hero"
            ? "border border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10"
            : "border border-app-border bg-transparent text-app-text hover:bg-app-surface-muted/60"),
        variant === "ghost" &&
          (context === "hero"
            ? "text-white hover:bg-white/10"
            : "text-app-text hover:bg-app-surface-muted/60"),
        className,
      )}
    >
      {label}
      {showArrow && variant === "primary" ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

export function CmsCtaButtonRow({
  buttons,
  align = "left",
  className,
  context = "default",
}: {
  buttons?: CmsButtonItem[];
  align?: "left" | "center";
  className?: string;
  context?: "hero" | "default";
}) {
  const items = (buttons ?? []).filter((item) => item.label?.trim() && item.url?.trim());
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      {items.map((item, index) => (
        <CmsCtaButton key={`${item.label}-${index}`} item={item} context={context} />
      ))}
    </div>
  );
}
