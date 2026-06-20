import { OfferingCatalogPageView } from "@/components/offerings/offering-catalog-section";
import { loadCatalogOfferings } from "@/lib/offerings";

export default async function TourPackagesCatalogPage() {
  const { items } = await loadCatalogOfferings("tours", { per_page: 24 });

  return (
    <OfferingCatalogPageView
      title="Tour packages"
      description="Browse curated domestic, international, and adventure tours."
      items={items}
      emptyMessage="No tour packages are listed yet."
    />
  );
}
