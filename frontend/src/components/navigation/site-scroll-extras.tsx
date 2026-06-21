"use client";

import { useSiteScrollRestoration } from "@/hooks/use-site-scroll-restoration";
import { ScrollJumpControls } from "@/components/navigation/scroll-jump-controls";

export function SiteScrollExtras() {
  useSiteScrollRestoration();
  return <ScrollJumpControls variant="site" />;
}
