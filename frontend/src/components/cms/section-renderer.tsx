import Link from "next/link";
import { ArrowUpRight, ChevronDown, Mail, MapPin } from "lucide-react";
import { FormFieldPreview } from "@/components/cms/form-fields-editor";
import { GalleryView } from "@/components/cms/gallery-view";
import { ItinerarySection } from "@/components/cms/itinerary-section";
import { InclusionsSection } from "@/components/offerings/inclusions-section";
import type { PageSection } from "@/lib/api";
import { resolveDivisionIcon } from "@/lib/division-page";
import {
  mapsLink,
  resolveVideoEmbed,
  type BannerContent,
  type CardItem,
  type CardsContent,
  type FaqContent,
  type FaqItem,
  type FormsContent,
  type GalleryContent,
  type InclusionsContent,
  type ItineraryContent,
  type MapContent,
  type SectionType,
  type StatsContent,
  type TestimonialItem,
  type TestimonialsContent,
  type TextContent,
  type VideoContent,
} from "@/lib/cms-sections";
import { cn } from "@/lib/utils";

function SectionShell({
  children,
  wide = false,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-app-border bg-app-surface/80 ring-1 ring-app-border",
        wide ? "p-6 md:p-8" : "p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <h2 className={cn("font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl", className)}>
      {children}
    </h2>
  );
}

function SectionBody({ text, className }: { text?: string; className?: string }) {
  if (!text?.trim()) return null;
  return (
    <div className={cn("space-y-3 text-base leading-relaxed text-app-muted", className)}>
      {text.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

function BannerSection({ content }: { content: BannerContent }) {
  const heading = content.heading?.trim();
  const subheading = content.subheading?.trim();
  const body = content.body?.trim();
  const imageUrl = content.image_url?.trim();
  const ctaLabel = content.cta_label?.trim();
  const ctaUrl = content.cta_url?.trim();

  if (!heading && !subheading && !body && !imageUrl) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-app-border ring-1 ring-app-border",
        imageUrl ? "min-h-[280px]" : "bg-gradient-to-br from-accent/15 via-app-surface/90 to-app-surface/80 p-8 md:p-12",
      )}
    >
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg/90 via-app-bg/70 to-app-bg/40" />
        </>
      )}
      <div className={cn("relative max-w-2xl", imageUrl && "p-8 md:p-12")}>
        {subheading && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-soft">{subheading}</p>
        )}
        {heading && (
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-app-text md:text-4xl">{heading}</h2>
        )}
        <SectionBody text={body} className="mt-4" />
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

function TextSection({ content }: { content: TextContent }) {
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  if (!heading && !body) return null;

  return (
    <SectionShell>
      <SectionHeading>{heading}</SectionHeading>
      <SectionBody text={body} className={heading ? "mt-4" : undefined} />
    </SectionShell>
  );
}

function GallerySection({ content }: { content: GalleryContent }) {
  const images = (content.images ?? []).filter((img) => img.url?.trim());
  if (images.length === 0 && !content.heading?.trim() && !content.body?.trim()) return null;

  const columns = content.columns ?? 3;
  const previewLimit = content.preview_limit ?? 6;

  return (
    <SectionShell wide>
      <SectionHeading>{content.heading?.trim()}</SectionHeading>
      <SectionBody text={content.body} className={content.heading?.trim() ? "mt-3" : undefined} />
      {images.length > 0 && (
        <GalleryView
          images={images}
          columns={columns}
          previewLimit={previewLimit}
          className={content.heading?.trim() || content.body?.trim() ? "mt-8" : undefined}
        />
      )}
    </SectionShell>
  );
}

function FaqSection({ content }: { content: FaqContent }) {
  const items = (content.items ?? []).filter((item) => item.question?.trim() && item.answer?.trim());
  if (items.length === 0 && !content.heading?.trim()) return null;

  const style = content.style === "list" ? "list" : "details";

  return (
    <SectionShell>
      <SectionHeading>{content.heading?.trim()}</SectionHeading>
      {style === "list" ? (
        <ul className={cn("list-disc space-y-6 pl-5 marker:text-accent-soft", content.heading?.trim() ? "mt-6" : undefined)}>
          {items.map((item, index) => (
            <FaqListItem key={`${item.question}-${index}`} item={item} />
          ))}
        </ul>
      ) : (
        <div className={cn("divide-y divide-app-border", content.heading?.trim() ? "mt-6" : undefined)}>
          {items.map((item, index) => (
            <FaqItemRow key={`${item.question}-${index}`} item={item} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function FaqListItem({ item }: { item: FaqItem }) {
  return (
    <li className="space-y-2">
      <p className="font-medium text-app-text">{item.question}</p>
      <p className="text-sm leading-relaxed text-app-muted">{item.answer}</p>
    </li>
  );
}

function FaqItemRow({ item }: { item: FaqItem }) {
  return (
    <details className="group py-4 first:pt-0 last:pb-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-app-text marker:content-none">
        <span>{item.question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-app-muted transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-app-muted">{item.answer}</p>
    </details>
  );
}

function VideoSection({ content }: { content: VideoContent }) {
  const embed = resolveVideoEmbed(content.video_url ?? "");
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  const caption = content.caption?.trim();

  if (!embed && !heading && !body) return null;

  return (
    <SectionShell wide>
      <SectionHeading>{heading}</SectionHeading>
      <SectionBody text={body} className={heading ? "mt-3" : undefined} />
      {embed && (
        <div className={cn("overflow-hidden rounded-xl border border-app-border bg-black/40", heading || body ? "mt-6" : undefined)}>
          {embed.type === "iframe" ? (
            <div className="aspect-video">
              <iframe
                src={embed.src}
                title={heading || "Embedded video"}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video src={embed.src} controls className="aspect-video w-full" preload="metadata" />
          )}
        </div>
      )}
      {caption && <p className="mt-3 text-center text-sm text-app-muted">{caption}</p>}
      {!embed && content.video_url?.trim() && (
        <p className="mt-4 text-sm text-status-error">Video URL could not be embedded. Use YouTube, Vimeo, or a direct .mp4 link.</p>
      )}
    </SectionShell>
  );
}

function CardsSection({ content }: { content: CardsContent }) {
  const items = (content.items ?? []).filter((item) => item.title?.trim() || item.description?.trim());
  if (items.length === 0 && !content.heading?.trim() && !content.body?.trim()) return null;

  return (
    <SectionShell wide>
      <SectionHeading>{content.heading?.trim()}</SectionHeading>
      <SectionBody text={content.body} className={content.heading?.trim() ? "mt-3" : undefined} />
      {items.length > 0 && (
        <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", content.heading?.trim() || content.body?.trim() ? "mt-8" : undefined)}>
          {items.map((item, index) => (
            <CardBlock key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function CardBlock({ item }: { item: CardItem }) {
  const CardIcon = item.icon?.trim() ? resolveDivisionIcon(item.icon) : null;
  const inner = (
    <>
      {item.badge?.trim() && (
        <span className="mb-3 inline-flex rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-soft">
          {item.badge}
        </span>
      )}
      {CardIcon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-soft ring-1 ring-accent/20">
          <CardIcon className="h-5 w-5" />
        </div>
      )}
      {item.image_url?.trim() && (
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {item.title?.trim() && <h3 className="font-display text-lg font-semibold text-app-text">{item.title}</h3>}
      {item.price?.trim() && <p className="mt-1 text-sm font-semibold text-accent-soft">{item.price}</p>}
      {item.meta_line?.trim() && <p className="mt-1 text-xs text-app-muted">{item.meta_line}</p>}
      {item.description?.trim() && <p className="mt-2 text-sm leading-relaxed text-app-muted">{item.description}</p>}
      {item.link_url?.trim() && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-soft">
          {item.link_label?.trim() || "Learn more"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );

  if (item.link_url?.trim()) {
    return (
      <Link
        href={item.link_url}
        className="group block rounded-xl border border-app-border bg-app-surface-muted/30 p-5 transition-colors hover:border-accent/30 hover:bg-app-surface-muted/50"
      >
        {inner}
      </Link>
    );
  }

  return <div className="rounded-xl border border-app-border bg-app-surface-muted/30 p-5">{inner}</div>;
}

function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  const items = (content.items ?? []).filter((item) => item.quote?.trim() && item.author?.trim());
  if (items.length === 0 && !content.heading?.trim()) return null;

  return (
    <SectionShell wide>
      <SectionHeading>{content.heading?.trim()}</SectionHeading>
      <div className={cn("grid gap-5 sm:grid-cols-2", content.heading?.trim() ? "mt-8" : undefined)}>
        {items.map((item, index) => (
          <TestimonialCard key={`${item.author}-${index}`} item={item} />
        ))}
      </div>
    </SectionShell>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <blockquote className="rounded-xl border border-app-border bg-app-surface-muted/30 p-6">
      <p className="text-base leading-relaxed text-app-text">&ldquo;{item.quote}&rdquo;</p>
      <footer className="mt-5 flex items-center gap-3">
        {item.avatar_url?.trim() ? (
          <div className="h-10 w-10 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.avatar_url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent-soft">
            {item.author.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <cite className="not-italic font-medium text-app-text">{item.author}</cite>
          {item.role?.trim() && <p className="text-sm text-app-muted">{item.role}</p>}
        </div>
      </footer>
    </blockquote>
  );
}

function MapSection({ content }: { content: MapContent }) {
  const embedUrl = content.embed_url?.trim();
  const address = content.address?.trim();
  const heading = content.heading?.trim();
  const body = content.body?.trim();

  if (!embedUrl && !address && !heading && !body) return null;

  return (
    <SectionShell wide>
      <SectionHeading>{heading}</SectionHeading>
      <SectionBody text={body} className={heading ? "mt-3" : undefined} />
      {embedUrl && (
        <div className={cn("overflow-hidden rounded-xl border border-app-border", heading || body ? "mt-6" : undefined)}>
          <iframe src={embedUrl} title={heading || "Map"} className="aspect-[16/9] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
      {address && (
        <a
          href={mapsLink(address)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium text-accent-soft hover:text-accent",
            embedUrl ? "mt-4" : heading || body ? "mt-6" : undefined,
          )}
        >
          <MapPin className="h-4 w-4" />
          {address}
        </a>
      )}
    </SectionShell>
  );
}

function StatsSection({ content }: { content: StatsContent }) {
  const items = (content.items ?? []).filter((item) => item.label?.trim() && item.value?.trim());
  if (items.length === 0 && !content.heading?.trim()) return null;

  const cols = content.columns ?? 3;
  const gridClass =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <SectionShell wide>
      <SectionHeading>{content.heading?.trim()}</SectionHeading>
      {items.length > 0 && (
        <div className={cn("mt-8 grid gap-6", gridClass)}>
          {items.map((item, index) => {
            const Icon = resolveDivisionIcon(item.icon ?? "clock");
            return (
              <div key={`${item.label}-${index}`} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-app-muted">{item.label}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-app-text">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

function FormsSection({ content }: { content: FormsContent }) {
  const fields = (content.fields ?? []).filter((field) => field.label?.trim());
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  const email = content.contact_email?.trim();

  if (fields.length === 0 && !heading && !body) return null;

  return (
    <SectionShell>
      <SectionHeading>{heading}</SectionHeading>
      <SectionBody text={body} className={heading ? "mt-3" : undefined} />
      {fields.length > 0 && (
        <form
          className={cn("space-y-4", heading || body ? "mt-6" : undefined)}
          action={email ? `mailto:${email}` : undefined}
          method="get"
          encType="multipart/form-data"
        >
          {fields.map((field, index) => (
            <FormFieldPreview
              key={`${field.label}-${index}`}
              field={field}
              name={field.label.toLowerCase().replace(/\s+/g, "_")}
            />
          ))}
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {content.submit_label?.trim() || "Send message"}
          </button>
          {email && (
            <p className="flex items-center gap-2 text-xs text-app-muted">
              <Mail className="h-3.5 w-3.5" />
              Submissions open your email client to {email}
            </p>
          )}
        </form>
      )}
    </SectionShell>
  );
}

function InclusionsCmsSection({ content }: { content: InclusionsContent }) {
  return (
    <SectionShell wide className="border-0 bg-transparent p-0 ring-0">
      <InclusionsSection
        heading={content.heading}
        included={content.included}
        excluded={content.excluded}
        included_label={content.included_label}
        excluded_label={content.excluded_label}
        className="px-0"
      />
    </SectionShell>
  );
}

function renderSection(section: PageSection) {
  const type = section.component_type as SectionType;
  const content = section.content;

  switch (type) {
    case "banner":
      return <BannerSection content={content as unknown as BannerContent} />;
    case "text":
      return <TextSection content={content as unknown as TextContent} />;
    case "gallery":
      return <GallerySection content={content as unknown as GalleryContent} />;
    case "faq":
      return <FaqSection content={content as unknown as FaqContent} />;
    case "video":
      return <VideoSection content={content as unknown as VideoContent} />;
    case "cards":
      return <CardsSection content={content as unknown as CardsContent} />;
    case "stats":
      return <StatsSection content={content as unknown as StatsContent} />;
    case "inclusions":
      return <InclusionsCmsSection content={content as unknown as InclusionsContent} />;
    case "itinerary":
      return <ItinerarySection content={content as unknown as ItineraryContent} />;
    case "testimonials":
      return <TestimonialsSection content={content as unknown as TestimonialsContent} />;
    case "map":
      return <MapSection content={content as unknown as MapContent} />;
    case "forms":
      return <FormsSection content={content as unknown as FormsContent} />;
    default:
      return <TextSection content={content as unknown as TextContent} />;
  }
}

export function CmsSectionRenderer({ section }: { section: PageSection }) {
  return renderSection(section);
}
