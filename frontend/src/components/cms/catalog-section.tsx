import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import type { CatalogContent } from "@/lib/cms-sections";
import { catalogPath, loadCatalogForCms } from "@/lib/offerings";

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface/80 p-8 ring-1 ring-app-border">
      {children}
    </section>
  );
}

export async function CatalogCmsSection({ content }: { content: CatalogContent }) {
  const items = await loadCatalogForCms({
    vertical: content.vertical,
    featured_only: content.featured_only,
    catalog_source: content.catalog_source,
    limit: content.limit,
  });

  if (items.length === 0) return null;

  const viewAllHref = catalogPath(content.vertical);
  const viewAllLabel = content.view_all_label?.trim() || "View all";

  return (
    <SectionShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {content.heading?.trim() && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl">
              {content.heading}
            </h2>
          )}
          {content.body?.trim() && <p className="mt-2 max-w-2xl text-app-muted">{content.body}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-soft hover:text-accent"
        >
          {viewAllLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <OfferingCardGrid>
        {items.map((item) => (
          <OfferingCard key={item.href} {...item} />
        ))}
      </OfferingCardGrid>
    </SectionShell>
  );
}
