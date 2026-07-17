export type OfferingCatalogSort =
  | "newest"
  | "featured"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export interface OfferingCatalogFilters {
  q?: string;
  category?: string;
  type?: string;
  sort?: OfferingCatalogSort;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  page?: number;
  per_page?: number;
}

export const OFFERING_CATALOG_SORT_OPTIONS: { value: OfferingCatalogSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

export const TOUR_TYPE_OPTIONS = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
  { value: "adventure", label: "Adventure" },
  { value: "group", label: "Group" },
  { value: "custom", label: "Custom" },
] as const;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}

function readBool(params: Record<string, string | string[] | undefined>, key: string): boolean {
  const value = readParam(params, key);
  return value === "1" || value === "true";
}

function readNumber(params: Record<string, string | string[] | undefined>, key: string): number | undefined {
  const value = readParam(params, key);
  if (!value) return undefined;
  const num = Number.parseFloat(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

export function parseOfferingCatalogParams(
  params: Record<string, string | string[] | undefined>,
): OfferingCatalogFilters {
  const sort = readParam(params, "sort") as OfferingCatalogSort | undefined;
  const validSort = OFFERING_CATALOG_SORT_OPTIONS.some((option) => option.value === sort)
    ? sort
    : "newest";

  return {
    q: readParam(params, "q"),
    category: readParam(params, "category"),
    type: readParam(params, "type"),
    sort: validSort,
    min_price: readNumber(params, "min_price"),
    max_price: readNumber(params, "max_price"),
    featured: readBool(params, "featured"),
    page: readNumber(params, "page") ?? 1,
    per_page: 12,
  };
}

export function buildOfferingCatalogQuery(filters: OfferingCatalogFilters): string {
  const query = new URLSearchParams();

  if (filters.q?.trim()) query.set("q", filters.q.trim());
  if (filters.category?.trim()) query.set("category", filters.category.trim());
  if (filters.type?.trim()) query.set("type", filters.type.trim());
  if (filters.sort && filters.sort !== "newest") query.set("sort", filters.sort);
  if (filters.min_price != null && filters.min_price > 0) {
    query.set("min_price", String(filters.min_price));
  }
  if (filters.max_price != null && filters.max_price > 0) {
    query.set("max_price", String(filters.max_price));
  }
  if (filters.featured) query.set("featured", "1");
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));

  const value = query.toString();
  return value ? `?${value}` : "";
}

export function offeringCatalogPath(basePath: string, filters: OfferingCatalogFilters): string {
  return `${basePath}${buildOfferingCatalogQuery(filters)}`;
}

export function activeOfferingFilterCount(filters: OfferingCatalogFilters): number {
  let count = 0;
  if (filters.q?.trim()) count += 1;
  if (filters.category) count += 1;
  if (filters.type) count += 1;
  if (filters.min_price != null && filters.min_price > 0) count += 1;
  if (filters.max_price != null && filters.max_price > 0) count += 1;
  if (filters.featured) count += 1;
  return count;
}
