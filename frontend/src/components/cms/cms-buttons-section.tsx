import type { ButtonsContent } from "@/lib/cms-sections";
import { FormattedBody, FormattedHeading } from "@/components/ui/formatted-text";
import { cn } from "@/lib/utils";
import { CmsCtaButtonRow } from "@/components/cms/cms-cta-button";

export function CmsButtonsSection({ content }: { content: ButtonsContent }) {
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  const align = content.align ?? "left";
  const hasButtons = (content.buttons ?? []).some((item) => item.label?.trim() && item.url?.trim());

  if (!heading && !body && !hasButtons) return null;

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-3xl rounded-2xl border border-app-border bg-app-surface/80 p-8 ring-1 ring-app-border md:p-10 lg:max-w-4xl",
        align === "center" && "text-center",
      )}
    >
      <FormattedHeading
        text={heading}
        format={content.heading_format}
        className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl"
      />
      <FormattedBody text={body} format={content.body_format} className="text-app-muted" />
      <CmsCtaButtonRow
        buttons={content.buttons}
        align={align}
        className={heading || body ? "mt-6" : undefined}
      />
    </section>
  );
}
