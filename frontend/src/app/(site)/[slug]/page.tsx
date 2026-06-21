import { notFound, redirect } from "next/navigation";
import { DivisionLandingPage } from "@/components/home/division-landing-page";
import { RESERVED_SITE_SLUGS } from "@/lib/division-page";

export const dynamic = "force-dynamic";

const CANONICAL_DIVISION_ROUTES: Record<string, string> = {
  academy: "/academy",
  shop: "/shop",
  tours: "/tours",
};

export default async function DynamicDivisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (CANONICAL_DIVISION_ROUTES[slug]) {
    redirect(CANONICAL_DIVISION_ROUTES[slug]);
  }

  if (RESERVED_SITE_SLUGS.has(slug)) {
    notFound();
  }

  return <DivisionLandingPage slug={slug} />;
}
