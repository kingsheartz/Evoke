import Link from "next/link";
import { ArrowUpRight, Images } from "lucide-react";
import type { OfferingCardData } from "@/lib/offerings";
import { joinMetaParts } from "@/lib/offerings";
import { cn } from "@/lib/utils";

const verticalAccent: Record<OfferingCardData["vertical"], string> = {
  tours: "group-hover:border-orange-500/40",
  shop: "group-hover:border-emerald-500/40",
  academy: "group-hover:border-violet-500/40",
};

export type OfferingCardProps = OfferingCardData & {
  className?: string;
  metaLine?: string;
};

export function OfferingCard({
  title,
  href,
  imageUrl,
  imageAlt,
  priceLabel,
  metaParts,
  metaLine,
  badge,
  galleryCount = 0,
  vertical,
  className,
}: OfferingCardProps) {
  const meta = metaLine ?? joinMetaParts(metaParts ?? []);

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface/80 ring-1 ring-app-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
        verticalAccent[vertical],
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-app-surface-muted/40">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt?.trim() || title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 via-app-surface-muted/30 to-app-surface-muted/60">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-app-muted/70">
              {vertical}
            </span>
          </div>
        )}

        {badge?.trim() && (
          <span className="absolute left-3 top-3 rounded-full bg-app-bg/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-soft ring-1 ring-app-border backdrop-blur-sm">
            {badge}
          </span>
        )}

        {galleryCount > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" />
            {galleryCount}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {priceLabel && (
          <p className="text-sm font-semibold text-accent-soft">{priceLabel}</p>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-app-text group-hover:text-accent-soft">
          {title}
        </h3>
        {meta && <p className="mt-2 text-sm text-app-muted">{meta}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-accent-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function OfferingCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</div>
  );
}
