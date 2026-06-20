import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryView } from "@/components/cms/gallery-view";
import { PageContainer } from "@/components/layout/app-shell";
import { OfferingHero } from "@/components/offerings/offering-hero";
import { InclusionsSection } from "@/components/offerings/inclusions-section";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import { StatsFactsBar } from "@/components/offerings/stats-facts-bar";
import { TimelineSection } from "@/components/offerings/timeline-section";
import type { StatItem } from "@/lib/cms-sections";
import type { GalleryImage } from "@/lib/cms-sections";
import type {
  InclusionsContent,
  OfferingCardData,
  OfferingVertical,
  TimelineContent,
} from "@/lib/offerings";
import { cn } from "@/lib/utils";

export type OfferingDetailShellProps = {
  vertical: OfferingVertical;
  title: string;
  description?: string | null;
  priceLabel: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaAction?: React.ReactNode;
  backHref: string;
  backLabel: string;
  heroImageUrl?: string | null;
  galleryImages: GalleryImage[];
  stats?: StatItem[];
  timeline?: TimelineContent;
  inclusions?: InclusionsContent;
  related?: OfferingCardData[];
  showInlineGallery?: boolean;
};

export function OfferingDetailShell({
  vertical,
  title,
  description,
  priceLabel,
  ctaLabel,
  ctaHref,
  ctaAction,
  backHref,
  backLabel,
  heroImageUrl,
  galleryImages,
  stats,
  timeline,
  inclusions,
  related,
  showInlineGallery = true,
}: OfferingDetailShellProps) {
  const validGallery = galleryImages.filter((image) => image.url?.trim());
  const hasTimeline = (timeline?.items ?? []).some((item) => item.title?.trim());
  const hasInclusions =
    (inclusions?.included ?? []).some((item) => item.trim()) ||
    (inclusions?.excluded ?? []).some((item) => item.trim());

  return (
    <article>
      <OfferingHero
        title={title}
        vertical={vertical}
        heroImageUrl={heroImageUrl}
        galleryImages={validGallery}
      />

      <PageContainer className="py-10">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-app-muted transition-colors hover:text-accent-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="mt-8 flex flex-col gap-6 border-b border-app-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent-soft">{priceLabel}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-app-text md:text-5xl">
              {title}
            </h1>
          </div>
          {ctaAction ?? (
            ctaHref ? (
              <Link
                href={ctaHref}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                {ctaLabel ?? "Learn more"}
              </Link>
            ) : null
          )}
        </div>
      </PageContainer>

      {stats && stats.length > 0 && <StatsFactsBar items={stats} bordered />}

      {description?.trim() && (
        <PageContainer className="py-12">
          <div className="mx-auto max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-app-muted">
            {description}
          </div>
        </PageContainer>
      )}

      {hasTimeline && timeline && (
        <div className={cn("py-12", !description?.trim() && "pt-8")}>
          <TimelineSection {...timeline} />
        </div>
      )}

      {hasInclusions && inclusions && (
        <div className="py-12">
          <InclusionsSection {...inclusions} />
        </div>
      )}

      {showInlineGallery && validGallery.length > 1 && (
        <PageContainer className="py-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl">Gallery</h2>
          <GalleryView images={validGallery} columns={3} previewLimit={6} className="mt-8" />
        </PageContainer>
      )}

      {related && related.length > 0 && (
        <PageContainer className="border-t border-app-border py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl">
            You may also like
          </h2>
          <OfferingCardGrid className="mt-8">
            {related.map((item) => (
              <OfferingCard key={item.href} {...item} />
            ))}
          </OfferingCardGrid>
        </PageContainer>
      )}
    </article>
  );
}
