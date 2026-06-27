import type { Metadata } from "next";
import { ShopProductsCatalog } from "@/components/shop/products-catalog";
import { apiClient } from "@/lib/api";
import { parseShopCatalogParams } from "@/lib/shop-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop products",
  description:
    "Browse sports equipment, apparel, and accessories. Search, filter by category and price, and sort to find the right product.",
};

export default async function ShopProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseShopCatalogParams(params);

  const [products, categoriesRes] = await Promise.all([
    apiClient.getShopProducts({
      q: filters.q,
      category: filters.category,
      sort: filters.sort,
      min_price: filters.min_price,
      max_price: filters.max_price,
      in_stock: filters.in_stock,
      on_sale: filters.on_sale,
      featured: filters.featured,
      page: filters.page,
      per_page: filters.per_page,
    }),
    apiClient.getShopCategories(),
  ]);

  return (
    <ShopProductsCatalog
      filters={filters}
      products={products}
      categories={categoriesRes.data.filter((category) => category.is_active !== false)}
    />
  );
}
