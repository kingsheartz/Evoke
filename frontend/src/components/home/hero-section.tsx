import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        "relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-cover bg-center",
        hero.background_type === "gradient" &&
          "bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900",
      )}
      style={bgStyle}
    >
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
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          {hero.heading ?? "Welcome to Evoke"}
        </h1>
        {hero.subheading && (
          <p className="mt-6 text-xl text-white/90 md:text-2xl">{hero.subheading}</p>
        )}
        {hero.cta_text && hero.cta_url && (
          <div className="mt-10">
            <Button asChild size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
              <Link href={hero.cta_url}>{hero.cta_text}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
