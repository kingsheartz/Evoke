import { notFound } from "next/navigation";
import { DivisionLandingView } from "@/components/home/division-landing-view";
import { apiClient } from "@/lib/api";
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

  try {
    const response = await apiClient.getDivisionPage(slug);
    if (!response.data) notFound();
    return <DivisionLandingView page={response.data} />;
  } catch {
    notFound();
  }
}
