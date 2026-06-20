export { GalleryView } from "@/components/cms/gallery-view";
export { InclusionsSection } from "@/components/offerings/inclusions-section";
export { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
export { OfferingCatalogPageView, OfferingCatalogSection } from "@/components/offerings/offering-catalog-section";
export { OfferingDetailShell } from "@/components/offerings/offering-detail-shell";
export { OfferingHero } from "@/components/offerings/offering-hero";
export { StatsFactsBar } from "@/components/offerings/stats-facts-bar";
export { TimelineSection } from "@/components/offerings/timeline-section";
export { VerticalDivisionPage } from "@/components/offerings/vertical-division-page";

export type { OfferingCardProps } from "@/components/offerings/offering-card";

export {
  catalogPath,
  catalogTitle,
  courseStats,
  courseToOffering,
  divisionPath,
  formatNextBatchLabel,
  formatOfferingPrice,
  itineraryDaysToTimeline,
  joinMetaParts,
  loadCatalogOfferings,
  loadFeaturedOfferings,
  loadRelatedOfferings,
  offeringCta,
  productStats,
  productToOffering,
  timelineVariantLabels,
  toGalleryImages,
  tourInclusionsContent,
  tourPackageStats,
  tourPackageToOffering,
} from "@/lib/offerings";

export type {
  InclusionsContent,
  OfferingCardData,
  OfferingVertical,
  TimelineContent,
  TimelineItem,
  TimelineVariant,
} from "@/lib/offerings";
