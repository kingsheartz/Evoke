"use client";

import Link from "next/link";
import { SiteHeaderBrand } from "@/components/brand/site-header-brand";
import { SiteHeaderAnnouncement, SiteHeaderExtras } from "@/components/brand/site-header-extras";
import type { BrandConfig } from "@/lib/brand-defaults";
import { cn } from "@/lib/utils";

const MOCK_NAV = ["Home", "Academy", "Shop", "Tours"];

export function SiteHeaderPreview({
  brand,
  variant = "desktop",
  className,
}: {
  brand: BrandConfig;
  variant?: "mobile" | "desktop";
  className?: string;
}) {
  const isMobile = variant === "mobile";

  return (
    <div className={cn("overflow-hidden rounded-lg border border-app-border", className)}>
      {/* Dark hero backdrop — header uses on-hero styles (light text) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c1524] to-sky-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.25), transparent 45%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.2), transparent 40%)",
          }}
          aria-hidden
        />

        <div className="relative">
          <SiteHeaderAnnouncement config={brand.header.announcement} preview />
          <div className="site-header-bar site-header-bar--on-hero relative">
            <div
              className={cn(
                "relative z-[1] mx-auto flex h-[4.5rem] items-center justify-between gap-3 px-4",
                isMobile ? "w-full max-w-[360px]" : "w-full max-w-6xl",
              )}
            >
              <SiteHeaderBrand brand={brand} href={null} elevated preview={variant} />

              {!isMobile ? (
                <nav className="flex flex-1 items-center justify-center gap-1">
                  {MOCK_NAV.map((label, index) => (
                    <span
                      key={label}
                      className={cn(
                        "site-header-link rounded-lg px-3 py-1.5 text-xs font-medium",
                        index === 0 ? "site-header-link-active" : "site-header-link-muted",
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </nav>
              ) : null}

              <div className="flex shrink-0 items-center gap-2">
                <SiteHeaderExtras components={brand.header.components} preview={variant} />
                {!isMobile ? (
                  <>
                    <Link
                      href="#"
                      className="site-header-action site-header-action-ghost inline-flex text-xs"
                      onClick={(e) => e.preventDefault()}
                    >
                      Sign in
                    </Link>
                    <span className="site-header-action site-header-action-outline inline-flex rounded-lg border px-3 py-1.5 text-xs">
                      Get started
                    </span>
                  </>
                ) : (
                  <span className="site-header-menu-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-xs">
                    ☰
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Faux hero content so the header reads in context */}
        <div
          className={cn(
            "pointer-events-none relative border-t border-white/5 px-4 pb-8 pt-6 text-white/50",
            isMobile ? "max-w-[360px]" : "max-w-6xl mx-auto",
          )}
        >
          <p className="text-[10px] uppercase tracking-[0.2em]">Page content below header</p>
        </div>
      </div>
    </div>
  );
}
