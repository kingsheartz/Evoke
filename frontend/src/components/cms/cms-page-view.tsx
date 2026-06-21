import type { PageSection } from "@/lib/api";
import { sectionTypeLabel } from "@/lib/api";
import { isSectionEmpty } from "@/lib/cms-sections";
import { PageContainer } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import { Fragment } from "react";

function visibleSections(sections: PageSection[]) {
  return sections.filter((s) => s.is_visible !== false && !isSectionEmpty(s));
}

export function pageUsesHeroLead(sections: PageSection[]): boolean {
  return visibleSections(sections)[0]?.component_type === "hero";
}

function HeroSectionBreakout({ section }: { section: PageSection }) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 sm:px-6 lg:px-8">
      <CmsSectionRenderer section={section} />
    </div>
  );
}

export function CmsPageSections({
  sections,
  layout = "default",
}: {
  sections: PageSection[];
  layout?: "default" | "hero-lead";
}) {
  const visible = visibleSections(sections);

  if (visible.length === 0) {
    return <p className="text-app-muted">This page has no content yet.</p>;
  }

  if (layout === "hero-lead" && visible[0]?.component_type === "hero") {
    const [hero, ...rest] = visible;

    return (
      <>
        <HeroSectionBreakout section={hero} />
        {rest.length > 0 ? (
          <PageContainer className="mt-8 space-y-8 pb-16 md:mt-10">
            {rest.map((section) => (
              <CmsSectionRenderer key={section.id} section={section} />
            ))}
          </PageContainer>
        ) : null}
      </>
    );
  }

  return (
    <div className="space-y-8">
      {visible.map((section) => {
        const rendered = <CmsSectionRenderer section={section} />;
        if (section.component_type !== "hero") {
          return <Fragment key={section.id}>{rendered}</Fragment>;
        }
        return <HeroSectionBreakout key={section.id} section={section} />;
      })}
    </div>
  );
}

export function SectionTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-indigo-400/35 bg-indigo-950/80 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-100",
        className,
      )}
    >
      {sectionTypeLabel(type)}
    </span>
  );
}
