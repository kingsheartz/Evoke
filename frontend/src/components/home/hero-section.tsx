import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/layout/page-illustration";
import type { HomepageData } from "@/lib/api";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  hero: HomepageData["hero"];
}

export function HeroSection({ hero }: HeroSectionProps) {
  const bgStyle =
    hero.background_type === "image" && hero.background_url
      ? { backgroundImage: `url(${hero.background_url})` }
      : undefined;

  return (
    <section
      className={cn(
        "relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-cover bg-center pt-20",
        hero.background_type === "gradient" &&
          "bg-gradient-to-br from-app-bg via-[#1a1530] to-app-bg",
      )}
      style={bgStyle}
    >
      <HeroIllustration />
      {hero.background_type === "video" && hero.video_url && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={hero.video_url} />
        </video>
      )}
      <div className="absolute inset-0 bg-app-bg/60" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter text-app-text md:text-7xl">
          {hero.heading ?? "Welcome to Evoke"}
        </h1>
        {hero.subheading && (
          <p className="mt-6 text-xl text-app-muted md:text-2xl">{hero.subheading}</p>
        )}
        {hero.cta_text && hero.cta_url && (
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href={hero.cta_url}>{hero.cta_text}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
