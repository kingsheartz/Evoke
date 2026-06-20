import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferingDetailShell } from "@/components/offerings/offering-detail-shell";
import { TourBookingAction } from "@/components/offerings/offering-tour-booking-action";
import { TourEnquiryAction } from "@/components/offerings/tour-enquiry-action";
import { apiClient } from "@/lib/api";
import {
  catalogPath,
  formatOfferingPrice,
  itineraryDaysToTimeline,
  loadRelatedOfferings,
  offeringCta,
  toGalleryImages,
  tourInclusionsContent,
  tourPackageStats,
} from "@/lib/offerings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apiClient.getTourPackage(slug);
    return {
      title: data.seo_title?.trim() || data.title,
      description: data.seo_description?.trim() || data.description || undefined,
    };
  } catch {
    return { title: "Tour package" };
  }
}

export default async function TourPackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [{ data: pkg }, related] = await Promise.all([
      apiClient.getTourPackage(slug),
      loadRelatedOfferings("tours", slug),
    ]);
    const cta = offeringCta("tours");
    const redirectPath = `/tours/${slug}`;
    const inclusions = tourInclusionsContent(pkg);
    const timelineItems = itineraryDaysToTimeline(pkg.itinerary_days ?? []);

    return (
      <OfferingDetailShell
        vertical="tours"
        title={pkg.title}
        description={pkg.description}
        priceLabel={formatOfferingPrice(pkg.price)}
        ctaLabel={cta.label}
        ctaAction={
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <TourBookingAction packageId={pkg.id} redirectPath={redirectPath} />
            <TourEnquiryAction packageId={pkg.id} packageTitle={pkg.title} />
          </div>
        }
        backHref={catalogPath("tours")}
        backLabel="All tour packages"
        heroImageUrl={toGalleryImages(pkg.gallery)[0]?.url}
        galleryImages={toGalleryImages(pkg.gallery)}
        stats={tourPackageStats(pkg)}
        timeline={
          timelineItems.length > 0
            ? { heading: "Itinerary", items: timelineItems, variant: "travel" }
            : undefined
        }
        inclusions={inclusions}
        related={related}
      />
    );
  } catch {
    notFound();
  }
}
