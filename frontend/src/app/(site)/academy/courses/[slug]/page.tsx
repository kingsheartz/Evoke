import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferingDetailShell } from "@/components/offerings/offering-detail-shell";
import { AcademyEnrollAction } from "@/components/offerings/offering-academy-enroll-action";
import { apiClient } from "@/lib/api";
import {
  catalogPath,
  courseStats,
  formatOfferingPrice,
  loadRelatedOfferings,
  offeringCta,
  toGalleryImages,
} from "@/lib/offerings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apiClient.getAcademyCourse(slug);
    return {
      title: data.seo_title?.trim() || data.title,
      description: data.seo_description?.trim() || data.description || undefined,
    };
  } catch {
    return { title: "Course" };
  }
}

export default async function AcademyCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [{ data: course }, related] = await Promise.all([
      apiClient.getAcademyCourse(slug),
      loadRelatedOfferings("academy", slug),
    ]);
    const cta = offeringCta("academy");
    const redirectPath = `/academy/courses/${slug}`;
    const gallery = toGalleryImages(course.gallery);
    const heroImage = course.thumbnail ?? gallery[0]?.url;

    return (
      <OfferingDetailShell
        vertical="academy"
        title={course.title}
        description={course.description}
        priceLabel={formatOfferingPrice(course.fees)}
        ctaLabel={cta.label}
        ctaHref={cta.href}
        ctaAction={<AcademyEnrollAction batches={course.batches ?? []} redirectPath={redirectPath} />}
        backHref={catalogPath("academy")}
        backLabel="All courses"
        heroImageUrl={heroImage}
        galleryImages={
          heroImage && !gallery.some((image) => image.url === heroImage)
            ? [{ url: heroImage, alt: course.title }, ...gallery]
            : gallery
        }
        stats={courseStats(course)}
        related={related}
      />
    );
  } catch {
    notFound();
  }
}
