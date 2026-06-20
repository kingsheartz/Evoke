import type { Course, Product, TourPackage } from "@/lib/api";
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
  return {
    heading: "Inclusions & Exclusions",
    included: pkg.inclusions ?? [],
    excluded: pkg.exclusions ?? [],
  };
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
