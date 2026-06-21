"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteAuthActions } from "@/components/layout/site-auth-actions";
import { PageContainer } from "@/components/layout/app-shell";
import { SiteHeaderBrand } from "@/components/brand/site-header-brand";
import { SiteHeaderAnnouncement, SiteHeaderExtras } from "@/components/brand/site-header-extras";
import { SiteAdTopStrip } from "@/components/site/site-ad-top-strip";
import { useBrand } from "@/components/providers/brand-provider";
import { useDivisionNav } from "@/hooks/use-division-nav";
import { cn } from "@/lib/utils";

const DEFAULT_CHROME_HEIGHT = "4.5rem";

function syncSiteChromeHeight(heightPx: number) {
  const value = heightPx > 0 ? `${heightPx}px` : DEFAULT_CHROME_HEIGHT;
  document.documentElement.style.setProperty("--site-chrome-height", value);
}

export function SiteHeader() {
  const pathname = usePathname();
  const brand = useBrand();
  const { items: navItems } = useDivisionNav();
  const shellRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const onHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 20;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const update = () => syncSiteChromeHeight(shell.offsetHeight);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(shell);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-chrome-height");
    };
  }, []);

  return (
    <div ref={shellRef} className="site-header-shell fixed inset-x-0 top-0 z-50">
      <SiteHeaderAnnouncement config={brand.header.announcement} />
      <header
        className={cn(
          "site-header-bar relative transition-[background-color,box-shadow] duration-300",
          scrolled && "glass-header",
          onHero && "site-header-bar--on-hero",
        )}
      >
        <PageContainer className="relative z-[1] flex h-[4.5rem] items-center justify-between gap-3">
          <SiteHeaderBrand brand={brand} elevated={onHero} />

          <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((link) => {
            const href = link.public_path ?? `/${link.slug}`;
            return (
              <Link
                key={link.slug}
                href={href}
                className={cn(
                  "site-header-link relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  pathname === href ? "site-header-link-active" : "site-header-link-muted",
                )}
              >
                {link.nav_label}
                {pathname === href && (
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SiteHeaderExtras components={brand.header.components} />
          <SiteAuthActions className="hidden items-center gap-2 md:flex" />
          <MobileNav />
        </div>
      </PageContainer>
    </header>
      <SiteAdTopStrip />
    </div>
  );
}
