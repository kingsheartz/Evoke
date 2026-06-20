export { GalleryView } from "@/components/cms/gallery-view";
export { InclusionsSection } from "@/components/offerings/inclusions-section";
export { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
export { StatsFactsBar } from "@/components/offerings/stats-facts-bar";
export { TimelineSection } from "@/components/offerings/timeline-section";

export type { OfferingCardProps } from "@/components/offerings/offering-card";

export {
  courseToOffering,
  formatOfferingPrice,
  itineraryDaysToTimeline,
  joinMetaParts,
  productToOffering,
  timelineVariantLabels,
  toGalleryImages,
  tourInclusionsContent,
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
