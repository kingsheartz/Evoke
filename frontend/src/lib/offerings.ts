import type { Course, Product, TourPackage } from "@/lib/api";
import { apiClient } from "@/lib/api";
import type { StatItem } from "@/lib/cms-sections";
import type { GalleryImage } from "@/lib/cms-sections";

export type OfferingVertical = "tours" | "shop" | "academy";

export type TimelineVariant = "travel" | "course" | "product";

export interface TimelineItem {
  title: string;
  body?: string;
  milestone?: "start" | "end";
}

export interface TimelineContent {
  heading?: string;
  cost_heading?: string;
  cost_body?: string;
  items?: TimelineItem[];
  variant?: TimelineVariant;
}

export interface InclusionsContent {
  heading?: string;
  included?: string[];
  excluded?: string[];
  included_label?: string;
  excluded_label?: string;
}

export interface OfferingCardData {
  title: string;
  href: string;
  imageUrl?: string | null;
  imageAlt?: string;
  priceLabel?: string;
  metaParts?: Array<string | null | undefined>;
  badge?: string;
  galleryCount?: number;
  vertical: OfferingVertical;
}

export function formatOfferingPrice(
  amount: string | number,
  options: { prefix?: string | false; currency?: string } = {},
): string {
  const { prefix = "From", currency = "₹" } = options;
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(num)) return "";

  const formatted = num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const price = `${currency}${formatted}`;
  return prefix === false ? price : `${prefix} ${price}`;
}

export function resolveMediaUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "object" && value !== null && "url" in value) {
    const url = (value as { url?: string }).url;
    return url?.trim() || null;
  }
  return null;
}

export function toGalleryImages(values: unknown[] | null | undefined): GalleryImage[] {
  if (!values?.length) return [];

  return values
    .map((entry) => {
      const url = resolveMediaUrl(entry);
      if (!url) return null;
      if (typeof entry === "object" && entry !== null) {
        const item = entry as { alt?: string; caption?: string };
        return { url, alt: item.alt, caption: item.caption };
      }
      return { url };
    })
    .filter((item): item is GalleryImage => item !== null);
}

export function joinMetaParts(parts: Array<string | null | undefined>): string {
  return parts.filter((part) => part?.trim()).join(" · ");
}

export function tourPackageToOffering(pkg: TourPackage): OfferingCardData {
  const gallery = pkg.gallery ?? [];
  const imageUrl = resolveMediaUrl(gallery[0]) ?? null;

  return {
    title: pkg.title,
    href: `/tours/${pkg.slug}`,
    imageUrl,
    imageAlt: pkg.title,
    priceLabel: formatOfferingPrice(pkg.price),
    metaParts: [
      `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}`,
      pkg.destination,
      pkg.type ? pkg.type.replace(/_/g, " ") : null,
    ],
    badge: pkg.is_featured ? "Featured" : undefined,
    galleryCount: gallery.length,
    vertical: "tours",
  };
}

export function productToOffering(product: Product): OfferingCardData {
  const images = product.images ?? [];
  const imageUrl = resolveMediaUrl(images[0]) ?? null;
  const stockLabel =
    product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? `${product.stock} left` : "In stock";

  return {
    title: product.name,
    href: `/shop/${product.slug}`,
    imageUrl,
    imageAlt: product.name,
    priceLabel: formatOfferingPrice(product.price),
    metaParts: [product.category?.name, stockLabel],
    badge: product.is_featured ? "Featured" : undefined,
    galleryCount: images.length,
    vertical: "shop",
  };
}

export function courseToOffering(course: Course, options?: { nextBatchLabel?: string }): OfferingCardData {
  return {
    title: course.title,
    href: `/academy/courses/${course.slug}`,
    imageUrl: resolveMediaUrl(course.thumbnail),
    imageAlt: course.title,
    priceLabel: formatOfferingPrice(course.fees),
    metaParts: [course.duration, course.category?.name, options?.nextBatchLabel],
    badge: course.status === "published" ? undefined : course.status,
    galleryCount: course.gallery?.length ?? 0,
    vertical: "academy",
  };
}

export function itineraryDaysToTimeline(
  days: Array<{ day_number: number; title: string; description?: string | null }>,
): TimelineItem[] {
  return days.map((day, index, all) => ({
    title: day.title?.trim() || `Day ${String(day.day_number).padStart(2, "0")}`,
    body: day.description ?? undefined,
    milestone: index === 0 ? "start" : index === all.length - 1 ? "end" : undefined,
  }));
}

export function tourInclusionsContent(pkg: TourPackage): InclusionsContent {
  const included = (pkg.inclusions ?? []).filter((item) => item.trim());
  const excluded = (pkg.exclusions ?? []).filter((item) => item.trim());
  if (included.length === 0 && excluded.length === 0) return { heading: "" };

  return {
    heading: "Inclusions & Exclusions",
    included,
    excluded,
  };
}

export function tourPackageStats(pkg: TourPackage): StatItem[] {
  return [
    { label: "Duration", value: `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}`, icon: "clock" },
    { label: "Destination", value: pkg.destination, icon: "globe" },
    { label: "Tour type", value: pkg.type.replace(/_/g, " "), icon: "compass" },
  ];
}

export function productStats(product: Product): StatItem[] {
  const stockLabel =
    product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? `${product.stock} left` : "In stock";

  return [
    { label: "Category", value: product.category?.name ?? "General", icon: "package" },
    { label: "Availability", value: stockLabel, icon: "clock" },
    { label: "SKU", value: product.sku, icon: "compass" },
  ];
}

export function formatNextBatchLabel(course: Course): string | undefined {
  const upcoming = (course.batches ?? [])
    .filter((batch) => ["upcoming", "open", "active"].includes(batch.status))
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

  if (!upcoming) return undefined;

  const date = new Date(upcoming.start_date);
  if (Number.isNaN(date.getTime())) return upcoming.name;

  return `Next batch ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function courseStats(course: Course): StatItem[] {
  const nextBatch = formatNextBatchLabel(course);

  return [
    { label: "Duration", value: course.duration?.trim() || "Flexible", icon: "clock" },
    { label: "Category", value: course.category?.name ?? "General", icon: "book-open" },
    { label: "Next batch", value: nextBatch ?? "Contact us", icon: "users" },
  ];
}

export function catalogPath(vertical: OfferingVertical): string {
  switch (vertical) {
    case "tours":
      return "/tours/packages";
    case "shop":
      return "/shop/products";
    case "academy":
      return "/academy/courses";
  }
}

export function divisionPath(vertical: OfferingVertical): string {
  return `/${vertical}`;
}

export function catalogTitle(vertical: OfferingVertical): string {
  switch (vertical) {
    case "tours":
      return "Tour packages";
    case "shop":
      return "Products";
    case "academy":
      return "Courses";
  }
}

export function offeringCta(vertical: OfferingVertical): { label: string; href: string } {
  switch (vertical) {
    case "tours":
      return { label: "Book now", href: "/sign-in" };
    case "shop":
      return { label: "Sign in to buy", href: "/sign-in" };
    case "academy":
      return { label: "Enroll now", href: "/sign-in" };
  }
}

export async function loadFeaturedOfferings(vertical: OfferingVertical): Promise<OfferingCardData[]> {
  switch (vertical) {
    case "tours": {
      const response = await apiClient.getTourPackages({ featured: true, per_page: 6 });
      return response.data.map(tourPackageToOffering);
    }
    case "shop": {
      const response = await apiClient.getShopProducts({ featured: true, per_page: 6 });
      return response.data.map(productToOffering);
    }
    case "academy": {
      const response = await apiClient.getAcademyCourses({ per_page: 6 });
      return response.data.map((course) => courseToOffering(course, { nextBatchLabel: formatNextBatchLabel(course) }));
    }
  }
}

export async function loadCatalogOfferings(
  vertical: OfferingVertical,
  params?: { page?: number; per_page?: number },
): Promise<{ items: OfferingCardData[]; total: number; lastPage: number }> {
  const per_page = params?.per_page ?? 12;
  const page = params?.page ?? 1;

  switch (vertical) {
    case "tours": {
      const response = await apiClient.getTourPackages({ page, per_page });
      return {
        items: response.data.map(tourPackageToOffering),
        total: response.total,
        lastPage: response.last_page,
      };
    }
    case "shop": {
      const response = await apiClient.getShopProducts({ page, per_page });
      return {
        items: response.data.map(productToOffering),
        total: response.total,
        lastPage: response.last_page,
      };
    }
    case "academy": {
      const response = await apiClient.getAcademyCourses({ page, per_page });
      return {
        items: response.data.map((course) =>
          courseToOffering(course, { nextBatchLabel: formatNextBatchLabel(course) }),
        ),
        total: response.total,
        lastPage: response.last_page,
      };
    }
  }
}

export async function loadRelatedOfferings(
  vertical: OfferingVertical,
  excludeSlug: string,
  limit = 3,
): Promise<OfferingCardData[]> {
  const { items } = await loadCatalogOfferings(vertical, { per_page: limit + 1 });
  return items.filter((item) => !item.href.endsWith(`/${excludeSlug}`)).slice(0, limit);
}

export function timelineVariantLabels(variant: TimelineVariant = "travel") {
  switch (variant) {
    case "course":
      return {
        heading: "Curriculum",
        costHeading: "Fees",
        emptyBody: "No module details added yet.",
        startLabel: "Start",
        endLabel: "Complete",
      };
    case "product":
      return {
        heading: "Details",
        costHeading: "Pricing",
        emptyBody: "No details added yet.",
        startLabel: "Overview",
        endLabel: "Summary",
      };
    default:
      return {
        heading: "Itinerary",
        costHeading: "Cost",
        emptyBody: "No details added for this day yet.",
        startLabel: "Start",
        endLabel: "End",
      };
  }
}
