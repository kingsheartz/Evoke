import { notFound } from "next/navigation";
import { DivisionLandingView } from "@/components/home/division-landing-view";
import { OfferingCatalogSection } from "@/components/offerings/offering-catalog-section";
import { apiClient } from "@/lib/api";
import { catalogPath, catalogTitle, loadDivisionFeaturedCatalog } from "@/lib/offerings";
import { resolveDivisionFeaturedCatalog } from "@/lib/division-page";

export async function DivisionLandingPage({ slug }: { slug: string }) {
  try {
    const { data: page } = await apiClient.getDivisionPage(slug);
    if (!page) notFound();

    const catalogConfig = resolveDivisionFeaturedCatalog(page);
    const featured = catalogConfig ? await loadDivisionFeaturedCatalog(catalogConfig) : [];

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
  } catch {
    notFound();
  }
}
