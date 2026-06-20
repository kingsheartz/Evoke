import { OfferingCatalogPageView } from "@/components/offerings/offering-catalog-section";
import { loadCatalogOfferings } from "@/lib/offerings";

export default async function AcademyCoursesCatalogPage() {
  const { items } = await loadCatalogOfferings("academy", { per_page: 24 });

  return (
    <OfferingCatalogPageView
      title="Academy courses"
      description="Programs across martial arts, fitness, dance, and more."
      items={items}
      emptyMessage="No courses are published yet."
    />
  );
}
