import { notFound } from "next/navigation";
import { DivisionLandingView } from "@/components/home/division-landing-view";
import { OfferingCatalogSection } from "@/components/offerings/offering-catalog-section";
import type { OfferingCardData } from "@/lib/offerings";
import { catalogPath, catalogTitle, loadDivisionFeaturedCatalog } from "@/lib/offerings";
import { loadDivisionPage, resolveDivisionFeaturedCatalog } from "@/lib/division-page";

export async function DivisionLandingPage({ slug }: { slug: string }) {
  let page;
  try {
    page = await loadDivisionPage(slug);
    if (!page) notFound();
  } catch {
    notFound();
  }

  const catalogConfig = resolveDivisionFeaturedCatalog(page);
  let featured: OfferingCardData[] = [];
  if (catalogConfig) {
    try {
      featured = await loadDivisionFeaturedCatalog(catalogConfig);
    } catch {
      featured = [];
    }
  }

  return (
    <DivisionLandingView
      page={page}
      featuredCatalog={
        featured.length > 0 && catalogConfig ? (
          <OfferingCatalogSection
            heading={catalogConfig.heading ?? `Featured ${catalogTitle(catalogConfig.vertical).toLowerCase()}`}
            items={featured}
            viewAllHref={catalogPath(catalogConfig.vertical)}
            viewAllLabel={
              catalogConfig.view_all_label ?? `Browse all ${catalogTitle(catalogConfig.vertical).toLowerCase()}`
            }
          />
        ) : undefined
      }
    />
  );
}
