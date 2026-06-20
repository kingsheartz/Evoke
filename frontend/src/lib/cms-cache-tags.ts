/** Next.js fetch cache tags for public CMS content. */
export const CMS_CACHE_TAGS = {
  homepage: "cms-homepage",
  divisions: "cms-divisions",
  division: (slug: string) => `division:${slug}`,
  pages: "cms-pages",
  page: (slug: string) => `cms-page:${slug}`,
} as const;

/** Next.js fetch cache tags for public catalog and detail pages. */
export const OFFERINGS_CACHE_TAGS = {
  tours: "offerings-tours",
  tour: (slug: string) => `tour:${slug}`,
  shop: "offerings-shop",
  product: (slug: string) => `product:${slug}`,
  academy: "offerings-academy",
  course: (slug: string) => `course:${slug}`,
} as const;
