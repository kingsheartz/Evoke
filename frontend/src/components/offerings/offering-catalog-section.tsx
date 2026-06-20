import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import type { OfferingCardData } from "@/lib/offerings";
import { cn } from "@/lib/utils";

export function OfferingCatalogSection({
  heading = "Featured",
  description,
  items,
  viewAllHref,
  viewAllLabel = "View all",
  className,
}: {
  heading?: string;
  description?: string;
  items: OfferingCardData[];
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className={cn("border-t border-app-border bg-app-surface/30 py-16", className)}>
      <PageContainer>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-app-text">{heading}</h2>
            {description?.trim() && <p className="mt-2 max-w-2xl text-app-muted">{description}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-soft hover:text-accent"
            >
              {viewAllLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <OfferingCardGrid>
          {items.map((item) => (
            <OfferingCard key={item.href} {...item} />
          ))}
        </OfferingCardGrid>
      </PageContainer>
    </section>
  );
}

export function OfferingCatalogPageView({
  title,
  description,
  items,
  emptyMessage = "Nothing listed yet. Check back soon.",
}: {
  title: string;
  description?: string;
  items: OfferingCardData[];
  emptyMessage?: string;
}) {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-app-text md:text-5xl">{title}</h1>
        {description?.trim() && <p className="mt-4 text-lg text-app-muted">{description}</p>}
      </div>

      {items.length > 0 ? (
        <OfferingCardGrid className="mt-12">
          {items.map((item) => (
            <OfferingCard key={item.href} {...item} />
          ))}
        </OfferingCardGrid>
      ) : (
        <p className="mt-12 rounded-2xl border border-dashed border-app-border px-6 py-12 text-center text-app-muted">
          {emptyMessage}
        </p>
      )}
    </PageContainer>
  );
}
