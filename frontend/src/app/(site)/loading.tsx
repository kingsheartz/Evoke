import { SitePageSkeleton } from "@/components/ui/page-skeleton";

/**
 * Soft-nav placeholder only — never a full-viewport trap.
 * Homepage itself streams via Suspense and should rarely hit this.
 */
export default function SiteLoading() {
  return <SitePageSkeleton />;
}
