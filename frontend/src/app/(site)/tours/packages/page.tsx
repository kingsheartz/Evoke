import type { Metadata } from "next";
import { OfferingsCatalog } from "@/components/offerings/offerings-catalog";
import { apiClient } from "@/lib/api";
import { parseOfferingCatalogParams } from "@/lib/offering-catalog";
import { tourPackageToOffering } from "@/lib/offerings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tour packages",
  description: "Search and filter domestic, international, and adventure tour packages.",
};

export default async function TourPackagesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseOfferingCatalogParams(params);

  const packages = await apiClient.getTourPackages({
    q: filters.q,
    type: filters.type,
    sort: filters.sort,
    min_price: filters.min_price,
    max_price: filters.max_price,
    featured: filters.featured,
    page: filters.page,
    per_page: filters.per_page,
  });

  return (
    <OfferingsCatalog
      vertical="tours"
      eyebrow="EVOKE Tours"
      title="Tour packages"
      description="Browse curated domestic, international, and adventure tours. Search by destination or filter by type and price."
      basePath="/tours/packages"
      searchPlaceholder="Search by title or destination…"
      emptyMessage="No tour packages match your filters"
      filters={filters}
      items={packages.data.map(tourPackageToOffering)}
      total={packages.total}
      currentPage={packages.current_page}
      lastPage={packages.last_page}
    />
  );
}
