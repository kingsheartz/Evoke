"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CMS_CACHE_TAGS, OFFERINGS_CACHE_TAGS } from "@/lib/cms-cache-tags";

async function applyRevalidation(tags: string[], paths: string[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
}

/** Bust cached homepage data and regenerate `/`. */
export async function revalidateHomepagePublicCache() {
  await applyRevalidation([CMS_CACHE_TAGS.homepage], ["/"]);
}

/** Bust cached division page, nav, and homepage (entry cards / nav links). */
export async function revalidateDivisionPublicCache(slug: string) {
  await applyRevalidation(
    [CMS_CACHE_TAGS.divisions, CMS_CACHE_TAGS.division(slug)],
    [`/${slug}`, "/"],
  );
}

/** Bust cached CMS page at `/p/[slug]`. */
export async function revalidateCmsPagePublicCache(slug: string) {
  await applyRevalidation(
    [CMS_CACHE_TAGS.pages, CMS_CACHE_TAGS.page(slug)],
    [`/p/${slug}`],
  );
}

/** Bust cached tour catalog and optional package detail page. */
export async function revalidateTourPublicCache(slug?: string) {
  await applyRevalidation(
    slug
      ? [OFFERINGS_CACHE_TAGS.tours, OFFERINGS_CACHE_TAGS.tour(slug)]
      : [OFFERINGS_CACHE_TAGS.tours],
    slug ? ["/tours", "/tours/packages", `/tours/${slug}`] : ["/tours", "/tours/packages"],
  );
}

/** Bust cached shop catalog and optional product detail page. */
export async function revalidateShopPublicCache(slug?: string) {
  await applyRevalidation(
    slug
      ? [OFFERINGS_CACHE_TAGS.shop, OFFERINGS_CACHE_TAGS.product(slug)]
      : [OFFERINGS_CACHE_TAGS.shop],
    slug ? ["/shop", "/shop/products", `/shop/${slug}`] : ["/shop", "/shop/products"],
  );
}

/** Bust cached academy catalog and optional course detail page. */
export async function revalidateAcademyPublicCache(slug?: string) {
  await applyRevalidation(
    slug
      ? [OFFERINGS_CACHE_TAGS.academy, OFFERINGS_CACHE_TAGS.course(slug)]
      : [OFFERINGS_CACHE_TAGS.academy],
    slug
      ? ["/academy", "/academy/courses", `/academy/courses/${slug}`]
      : ["/academy", "/academy/courses"],
  );
}
