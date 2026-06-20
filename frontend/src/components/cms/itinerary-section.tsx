"use client";

import type { ItineraryContent } from "@/lib/cms-sections";
import { TimelineSection } from "@/components/offerings/timeline-section";

export function ItinerarySection({ content }: { content: ItineraryContent }) {
  return (
    <TimelineSection
      heading={content.heading}
      cost_heading={content.cost_heading}
      cost_body={content.cost_body}
      items={content.items}
      variant="travel"
    />
  );
}
