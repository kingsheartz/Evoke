"use client";

import type { TabsContent as TabsSectionContent, TabItem } from "@/lib/cms-sections";
import { FormattedBody, FormattedHeading, FormattedText } from "@/components/ui/formatted-text";
import { Tabs, TabsContent, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function TabPanelBody({ text, format }: { text?: string; format?: TabItem["body_format"] }) {
  if (!text?.trim()) return <p className="text-app-muted">No content yet.</p>;
  return <FormattedBody text={text} format={format} className="text-app-muted" />;
}

export function CmsTabsSection({ content }: { content: TabsSectionContent }) {
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  const tabs = (content.tabs ?? []).filter((tab) => tab.label?.trim());
  const style = content.style ?? "pills";

  if (tabs.length === 0 && !heading && !body) return null;

  const defaultTab = tabs[0]?.label ?? "tab-0";

  return (
    <section className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border md:p-8">
      <FormattedHeading
        text={heading}
        format={content.heading_format}
        className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl"
      />
      <FormattedBody text={body} format={content.body_format} className="text-app-muted" />

      {tabs.length > 0 ? (
        <Tabs defaultValue={defaultTab} className={cn(heading || body ? "mt-6" : undefined)}>
          <TabsList className={cn(style === "underline" && "gap-0 border-b border-app-border pb-0")}>
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={`${tab.label}-${index}`}
                value={tab.label}
                className={cn(
                  style === "underline" &&
                    "rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-2 ring-0 hover:bg-transparent hover:text-app-text aria-[selected=true]:border-accent aria-[selected=true]:bg-transparent aria-[selected=true]:text-accent-soft",
                )}
              >
                <FormattedText text={tab.label} format={tab.label_format} as="span" />
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsPanel>
            {tabs.map((tab, index) => (
              <TabsContent key={`${tab.label}-${index}`} value={tab.label}>
                <TabPanelBody text={tab.body} format={tab.body_format} />
              </TabsContent>
            ))}
          </TabsPanel>
        </Tabs>
      ) : null}
    </section>
  );
}
