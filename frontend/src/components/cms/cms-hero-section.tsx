import type { HeroContent } from "@/lib/cms-sections";
import { heroBackgroundImages, heroSlideshowSettings } from "@/lib/cms-sections";
import { resolvePublicMediaUrl } from "@/lib/media";
import { FormattedText } from "@/components/ui/formatted-text";
import { cn } from "@/lib/utils";
import { CmsCtaButtonRow } from "@/components/cms/cms-cta-button";
import { CmsHeroBackground } from "@/components/cms/cms-hero-background";

const heightClass = {
  full: "min-h-[min(92vh,920px)]",
  tall: "min-h-[min(75vh,720px)]",
  medium: "min-h-[min(55vh,520px)]",
} as const;

const overlayClass = {
  dark: "bg-black/55",
  gradient: "bg-gradient-to-r from-black/80 via-black/45 to-black/20",
  light: "bg-white/30",
  none: "",
} as const;

export function CmsHeroSection({ content }: { content: HeroContent }) {
  const heading = content.heading?.trim();
  const headingAccent = content.heading_accent?.trim();
  const headingSuffix = content.heading_suffix?.trim();
  const body = content.body?.trim();
  const backgroundImages = heroBackgroundImages(content);
  const slideshow = heroSlideshowSettings(content);
  const videoUrl = resolvePublicMediaUrl(content.video_url);
  const useVideo = content.background_type === "video" && Boolean(videoUrl);
  const hasBackground = backgroundImages.length > 0 || useVideo;
  const hasForegroundContent = Boolean(
    heading || headingSuffix || body || content.eyebrow?.trim() || content.buttons?.length,
  );
  const height = content.height ?? "full";
  const effectiveHeight =
    hasBackground && !hasForegroundContent && height === "full" ? "medium" : height;
  const align = content.align ?? "left";
  const overlay = content.overlay ?? "gradient";

  if (!heading && !headingSuffix && !body && !content.eyebrow?.trim() && !hasBackground) return null;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-none md:rounded-2xl",
        heightClass[effectiveHeight],
        !hasBackground && "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      )}
    >
      {useVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : backgroundImages.length > 0 ? (
        <CmsHeroBackground images={backgroundImages} settings={slideshow} />
      ) : null}

      {overlay !== "none" && hasBackground ? (
        <div className={cn("absolute inset-0", overlayClass[overlay])} />
      ) : null}

      {hasForegroundContent ? (
      <div
        className={cn(
          "relative flex h-full min-h-[inherit] items-end px-6 pb-14 pt-28 md:px-12 md:pb-16 md:pt-32",
          align === "center" && "justify-center text-center",
        )}
      >
        <div className={cn("max-w-3xl text-white", align === "center" && "mx-auto")}>
          <FormattedText
            text={content.eyebrow}
            format={content.eyebrow_format}
            as="p"
            className="text-xs font-semibold tracking-[0.2em] text-accent-soft"
          />

          {(heading || headingAccent || headingSuffix) && (
            <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              <FormattedText text={heading} format={content.heading_format} as="span" />
              {heading && headingAccent ? " " : null}
              <FormattedText
                text={headingAccent}
                format={
                  content.heading_accent_format ?? {
                    fontFamily: "serif",
                    italic: true,
                    fontSize: "inherit",
                    textTransform: "none",
                    color: "white",
                  }
                }
                as="span"
                className="font-serif text-3xl normal-case italic text-amber-100/95 md:text-5xl lg:text-6xl"
              />
              {headingAccent && headingSuffix ? " " : null}
              <FormattedText text={headingSuffix} format={content.heading_suffix_format} as="span" />
            </h2>
          )}

          <FormattedText
            text={body}
            format={content.body_format}
            as="p"
            className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg"
          />

          <CmsCtaButtonRow buttons={content.buttons} align={align} context="hero" className="mt-8" />
        </div>
      </div>
      ) : null}
    </section>
  );
}
