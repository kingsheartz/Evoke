import { notFound } from "next/navigation";
import { DivisionLandingView } from "@/components/home/division-landing-view";
import { OfferingCatalogSection } from "@/components/offerings/offering-catalog-section";
import { apiClient } from "@/lib/api";
import {
  catalogPath,
  catalogTitle,
  loadFeaturedOfferings,
  type OfferingVertical,
} from "@/lib/offerings";

export async function VerticalDivisionPage({ vertical }: { vertical: OfferingVertical }) {
  try {
    const [division, featured] = await Promise.all([
      apiClient.getDivisionPage(vertical),
      loadFeaturedOfferings(vertical).catch(() => []),
    ]);

    if (!division.data) notFound();

    return (
      <DivisionLandingView
        page={division.data}
        featuredCatalog={
          <OfferingCatalogSection
            heading={`Featured ${catalogTitle(vertical).toLowerCase()}`}
            items={featured}
            viewAllHref={catalogPath(vertical)}
            viewAllLabel={`Browse all ${catalogTitle(vertical).toLowerCase()}`}
          />
        }
      />
    );
  } catch {
    notFound();
  }
}
