import { notFound } from "next/navigation";
import { DivisionLandingPage } from "@/components/home/division-landing-page";
import { RESERVED_SITE_SLUGS } from "@/lib/division-page";

export default async function DynamicDivisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (RESERVED_SITE_SLUGS.has(slug)) {
    notFound();
  }

  return <DivisionLandingPage slug={slug} />;
}
