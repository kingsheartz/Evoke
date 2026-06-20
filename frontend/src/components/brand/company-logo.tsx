"use client";

import Link from "next/link";
import { useBrand } from "@/components/providers/brand-provider";
import type { BrandConfig } from "@/lib/brand-defaults";
import { mobileHeaderIcon, type BrandLogoVariant } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIZE: Record<Exclude<BrandLogoVariant, "header">, string> = {
  icon: "brand-logo--header-icon",
  horizontal: "h-10 w-auto max-w-[220px] sm:max-w-[260px]",
  vertical: "h-28 w-auto max-w-[200px] sm:h-32",
  footer: "h-11 w-auto max-w-[260px]",
  auth: "h-28 w-auto max-w-[200px] sm:h-32",
  admin: "brand-logo--admin-icon",
  "admin-icon": "brand-logo--admin-icon",
};

function logoSrc(variant: BrandLogoVariant, logos: BrandConfig["logos"]): string {
  switch (variant) {
    case "icon":
    case "admin-icon":
      return mobileHeaderIcon(logos);
    case "vertical":
    case "auth":
      return logos.vertical || logos.horizontal;
    case "horizontal":
    case "footer":
    case "admin":
    case "header":
      return logos.horizontal || logos.vertical;
  }
}

function logoImageClass(blend: boolean, elevated: boolean, extra?: string) {
  return cn(
    "brand-logo object-contain object-left",
    blend && "brand-logo--blend",
    elevated && "brand-logo--elevated",
    extra,
  );
}

export interface CompanyLogoProps {
  variant?: BrandLogoVariant;
  href?: string | null;
  className?: string;
  blend?: boolean;
  elevated?: boolean;
  /** Preview or SSR override — skips context when set. */
  brand?: BrandConfig;
}

export function CompanyLogo({
  variant = "horizontal",
  href = "/",
  className,
  blend = true,
  elevated = false,
  brand: brandProp,
}: CompanyLogoProps) {
  const contextBrand = useBrand();
  const brand = brandProp ?? contextBrand;
  const mobileSrc = mobileHeaderIcon(brand.logos);
  const iconBlend = brand.logoDisplay.iconBlend;

  const content =
    variant === "header" ? (
      /* Icon-only header — larger mark, no horizontal wordmark */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mobileSrc}
        alt={brand.name}
        className={logoImageClass(iconBlend, elevated, "brand-logo--header-icon")}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc(variant, brand.logos)}
        alt={brand.name}
        className={logoImageClass(
          variant === "icon" || variant === "admin-icon" ? iconBlend : blend,
          elevated,
          SIZE[variant],
        )}
      />
    );

  const wrapperClass = cn(
    "inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
    variant === "auth" && "justify-center",
    className,
  );

  if (href == null) {
    return <span className={wrapperClass}>{content}</span>;
  }

  return (
    <Link href={href} className={wrapperClass} aria-label={`${brand.name} home`}>
      {content}
    </Link>
  );
}

/** @deprecated Use CompanyLogo */
export const EvokeLogo = CompanyLogo;
