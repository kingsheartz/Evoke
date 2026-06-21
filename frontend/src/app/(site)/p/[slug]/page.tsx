import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CmsPageSections, pageUsesHeroLead } from "@/components/cms/cms-page-view";
import { PageContainer } from "@/components/layout/app-shell";
import { apiClient } from "@/lib/api";

export default async function PublicCmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page;
  try {
    const response = await apiClient.getPublicPage(slug);
    page = response.data;
  } catch {
    notFound();
  }

  const sections = page.sections ?? [];
  const heroLead = pageUsesHeroLead(sections);

  if (heroLead) {
    return (
      <div className="relative pb-16">
        <PageContainer className="pointer-events-none absolute inset-x-0 top-0 z-20 py-4 md:py-6">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 text-sm font-medium text-white/90 drop-shadow-sm transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </PageContainer>

        <CmsPageSections sections={sections} layout="hero-lead" />
      </div>
    );
  }

  return (
    <PageContainer className="py-16 md:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-app-muted transition-colors hover:text-accent-soft"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <header className="max-w-3xl border-b border-app-border pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-soft">{page.type}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-app-text md:text-5xl">
          {page.title}
        </h1>
        {page.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-app-muted">{page.excerpt}</p>
        )}
      </header>

      <div className="mt-12">
        <CmsPageSections sections={sections} />
      </div>
    </PageContainer>
  );
}
