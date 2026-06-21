import type { PageSection } from "@/lib/api";
import { sectionTypeLabel } from "@/lib/api";
import { isSectionEmpty } from "@/lib/cms-sections";
import { cn } from "@/lib/utils";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import { Fragment } from "react";

export function CmsPageSections({ sections }: { sections: PageSection[] }) {
  const visible = sections.filter((s) => s.is_visible !== false && !isSectionEmpty(s));

  if (visible.length === 0) {
    return <p className="text-app-muted">This page has no content yet.</p>;
  }

  return (
    <div className="space-y-8">
      {visible.map((section) => {
        const rendered = <CmsSectionRenderer section={section} />;
        if (section.component_type !== "hero") {
          return <Fragment key={section.id}>{rendered}</Fragment>;
        }
        return (
          <div
            key={section.id}
            className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 sm:px-6 lg:px-8"
          >
            {rendered}
          </div>
        );
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
