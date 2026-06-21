import { OfferingCatalogPageView } from "@/components/offerings/offering-catalog-section";
import { loadCatalogOfferings } from "@/lib/offerings";

export const dynamic = "force-dynamic";

export default async function ShopProductsCatalogPage() {
  const { items } = await loadCatalogOfferings("shop", { per_page: 24 });

  return (
    <OfferingCatalogPageView
      title="Shop products"
      description="Curated sports equipment and academy merchandise."
      items={items}
      emptyMessage="No products are listed yet."
    />
  );
}
