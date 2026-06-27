import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import type { DivisionAccentStyle } from "@/lib/division-page";
import { getDivisionHeroAccent } from "@/lib/division-page";
import { cn } from "@/lib/utils";

export function DivisionHero({
  badge,
  title,
  description,
  icon: Icon,
  accentStyle = "accent",
  children,
}: {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentStyle?: DivisionAccentStyle;
  children?: ReactNode;
}) {
  const accent = getDivisionHeroAccent(accentStyle);

  return (
    <section className="relative overflow-hidden pt-32 pb-16 mesh-bg">
      <AmbientGlow className="opacity-50" />
      <PageContainer className="relative">
        <div className="max-w-2xl">
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
              accent.border,
              accent.bg,
              accent.text,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {badge}
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-app-text md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-app-muted">{description}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </PageContainer>
    </section>
  );
}

export function DivisionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PageContainer className={cn("py-16", className)}>{children}</PageContainer>
  );
}
