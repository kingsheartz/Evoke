"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CMS_CACHE_TAGS } from "@/lib/cms-cache-tags";

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
