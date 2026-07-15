import type { Metadata } from "next";
import { OfferingsCatalog } from "@/components/offerings/offerings-catalog";
import { apiClient } from "@/lib/api";
import { parseOfferingCatalogParams } from "@/lib/offering-catalog";
import { courseToOffering } from "@/lib/offerings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Academy courses",
  description: "Search and filter academy courses by category, price, and name.",
};

export default async function AcademyCoursesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseOfferingCatalogParams(params);

  const [courses, categoriesRes] = await Promise.all([
    apiClient.getAcademyCourses({
      q: filters.q,
      category: filters.category,
      sort: filters.sort,
      min_price: filters.min_price,
      max_price: filters.max_price,
      featured: filters.featured,
      page: filters.page,
      per_page: filters.per_page,
    }),
    apiClient.getAcademyCategories(),
  ]);

  return (
    <OfferingsCatalog
      vertical="academy"
      eyebrow="EVOKE Academy"
      title="Academy courses"
      description="Programs across martial arts, fitness, dance, and more. Search by name or filter by category and fees."
      basePath="/academy/courses"
      searchPlaceholder="Search by course name…"
      emptyMessage="No courses match your filters"
      filters={filters}
      items={courses.data.map((course) => courseToOffering(course))}
      total={courses.total}
      currentPage={courses.current_page}
      lastPage={courses.last_page}
      categories={categoriesRes.data.filter((category) => category.is_active !== false)}
    />
  );
}
