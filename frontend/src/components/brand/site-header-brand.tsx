"use client";

import Link from "next/link";
import { CompanyLogo } from "@/components/brand/company-logo";
import { FormattedText } from "@/components/ui/formatted-text";
import type { BrandConfig } from "@/lib/brand-defaults";
import { brandHeaderFontClass } from "@/lib/brand-header-fonts";
import { cn } from "@/lib/utils";

export function SiteHeaderBrand({
  brand,
  href = "/",
  elevated = false,
  className,
  preview,
}: {
  brand: BrandConfig;
  href?: string | null;
  elevated?: boolean;
  className?: string;
  /** Admin preview: force mobile (icon only) or desktop (with text) layout. */
  preview?: "mobile" | "desktop";
}) {
  const headerText = brand.logoDisplay.headerText?.trim() ?? "";
  const headerSubheading = brand.logoDisplay.headerSubheading?.trim() ?? "";
  const showText = Boolean(headerText || headerSubheading);
  const fontClass = brandHeaderFontClass(brand.logoDisplay.headerFont);

  const textVisibility =
    preview === "mobile"
      ? "hidden"
      : preview === "desktop"
        ? showText
          ? "flex"
          : "hidden"
        : showText
          ? "hidden lg:flex"
          : "hidden";

  const lockup = (
    <>
      <CompanyLogo variant="header" href={null} brand={brand} elevated={elevated} />
      {showText && (
        <div
          className={cn(
            "site-header-brand-text min-w-0 flex-col justify-center leading-tight",
            textVisibility,
            fontClass,
          )}
        >
          {headerText ? (
            <FormattedText
              text={headerText}
              format={brand.logoDisplay.headerText_format}
              as="span"
              className="site-header-brand-title truncate"
            />
          ) : null}
          {headerSubheading ? (
            <FormattedText
              text={headerSubheading}
              format={brand.logoDisplay.headerSubheading_format}
              as="span"
              className="site-header-brand-sub truncate"
            />
          ) : null}
        </div>
      )}
    </>
  );

  const wrapperClass = cn("site-header-brand inline-flex min-w-0 items-center gap-3", className);

  if (href == null) {
    return <span className={wrapperClass}>{lockup}</span>;
  }

  return (
    <Link href={href} className={wrapperClass} aria-label={`${brand.name} home`}>
      {lockup}
    </Link>
  );
}
