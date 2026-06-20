/** Next.js fetch cache tags for public CMS content. */
export const CMS_CACHE_TAGS = {
  homepage: "cms-homepage",
  divisions: "cms-divisions",
  division: (slug: string) => `division:${slug}`,
  pages: "cms-pages",
  page: (slug: string) => `cms-page:${slug}`,
} as const;
