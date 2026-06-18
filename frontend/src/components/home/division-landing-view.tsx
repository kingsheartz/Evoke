import { DivisionContent, DivisionHero } from "@/components/layout/division-hero";
import { HomepageExtraSections } from "@/components/home/homepage-extra-sections";
import {
  getDivisionCardAccent,
  parseDivisionMeta,
  resolveDivisionIcon,
  type DivisionPageData,
} from "@/lib/division-page";
import { cn } from "@/lib/utils";

export function DivisionLandingView({
  page,
}: {
  page: DivisionPageData;
}) {
  const HeroIcon = resolveDivisionIcon(page.icon);
  const accent = getDivisionCardAccent(page.accent_style ?? "accent");
  const { sections } = parseDivisionMeta(page.meta);

  return (
    <>
      <DivisionHero
        badge={page.badge}
        title={page.title}
        description={page.description}
        icon={HeroIcon}
      />
      <DivisionContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {page.highlight_cards.map((card) => {
            const CardIcon = resolveDivisionIcon(card.icon);
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border transition-colors hover:border-accent/25 hover:bg-app-surface"
              >
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                    accent.bg,
                    accent.ring,
                  )}
                >
                  <CardIcon className={cn("h-5 w-5", accent.icon)} />
                </div>
                <h3 className="font-display font-semibold text-app-text">{card.title}</h3>
                <p className="mt-1 text-sm text-app-muted">{card.description}</p>
              </div>
            );
          })}
        </div>
        {page.footer_note && (
          <p className="mt-12 text-center text-sm text-app-muted">{page.footer_note}</p>
        )}
      </DivisionContent>
      {sections.length > 0 && <HomepageExtraSections sections={sections} />}
    </>
  );
}
