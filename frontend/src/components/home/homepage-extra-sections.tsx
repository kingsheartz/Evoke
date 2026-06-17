import type { PageSection } from "@/lib/api";
import { isSectionEmpty } from "@/lib/cms-sections";
import type { HomepageSection } from "@/lib/homepage-meta";
import { PageContainer } from "@/components/layout/app-shell";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";

function toPageSection(section: HomepageSection): PageSection {
  return {
    id: section.sort_order,
    page_id: 0,
    component_type: section.component_type,
    content: section.content,
    sort_order: section.sort_order,
    is_visible: section.is_visible,
  };
}

export function HomepageExtraSections({ sections }: { sections: HomepageSection[] }) {
  const visible = sections
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((s) => !isSectionEmpty({ component_type: s.component_type, content: s.content }));

  if (visible.length === 0) return null;

  return (
    <section className="border-t border-app-border bg-app-bg py-20">
      <PageContainer>
        <div className="space-y-8">
          {visible.map((section) => (
            <CmsSectionRenderer key={section.id} section={toPageSection(section)} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
