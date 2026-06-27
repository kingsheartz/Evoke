export type ShopCatalogSort =
  | "newest"
  | "featured"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export interface ShopCatalogFilters {
  q?: string;
  category?: string;
  sort?: ShopCatalogSort;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  featured?: boolean;
  page?: number;
  per_page?: number;
}

export const SHOP_CATALOG_SORT_OPTIONS: { value: ShopCatalogSort; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

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

export function parseShopCatalogParams(
  params: Record<string, string | string[] | undefined>,
): ShopCatalogFilters {
  const sort = readParam(params, "sort") as ShopCatalogSort | undefined;
  const validSort = SHOP_CATALOG_SORT_OPTIONS.some((option) => option.value === sort) ? sort : "newest";

  return {
    q: readParam(params, "q"),
    category: readParam(params, "category"),
    sort: validSort,
    min_price: readNumber(params, "min_price"),
    max_price: readNumber(params, "max_price"),
    in_stock: readBool(params, "in_stock"),
    on_sale: readBool(params, "on_sale"),
    featured: readBool(params, "featured"),
    page: readNumber(params, "page") ?? 1,
    per_page: 24,
  };
}

export function buildShopCatalogQuery(filters: ShopCatalogFilters): string {
  const query = new URLSearchParams();

  if (filters.q?.trim()) query.set("q", filters.q.trim());
  if (filters.category?.trim()) query.set("category", filters.category.trim());
  if (filters.sort && filters.sort !== "newest") query.set("sort", filters.sort);
  if (filters.min_price != null && filters.min_price > 0) {
    query.set("min_price", String(filters.min_price));
  }
  if (filters.max_price != null && filters.max_price > 0) {
    query.set("max_price", String(filters.max_price));
  }
  if (filters.in_stock) query.set("in_stock", "1");
  if (filters.on_sale) query.set("on_sale", "1");
  if (filters.featured) query.set("featured", "1");
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));

  return query.toString();
}

export function shopCatalogPath(filters: ShopCatalogFilters): string {
  const query = buildShopCatalogQuery(filters);
  return query ? `/shop/products?${query}` : "/shop/products";
}

export function activeShopFilterCount(filters: ShopCatalogFilters): number {
  let count = 0;
  if (filters.category) count += 1;
  if (filters.min_price != null && filters.min_price > 0) count += 1;
  if (filters.max_price != null && filters.max_price > 0) count += 1;
  if (filters.in_stock) count += 1;
  if (filters.on_sale) count += 1;
  if (filters.featured) count += 1;
  return count;
}
