"use client";

import { useEffect } from "react";
import { useBrand } from "@/components/providers/brand-provider";
import { DEFAULT_BRAND } from "@/lib/brand-defaults";

/** Bump when regenerating app/icon.png so browsers drop cached tab icons. */
const FAVICON_VERSION = "2";

const DEFAULT_ICON = `/icon.png?v=${FAVICON_VERSION}`;
const DEFAULT_APPLE = `/apple-icon.png?v=${FAVICON_VERSION}`;

function applyFavicon(href: string, appleHref: string) {
  const iconLinks = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
  );

  if (iconLinks.length === 0) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.href = href;
    document.head.appendChild(icon);

    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = appleHref;
    document.head.appendChild(apple);
    return;
  }

  iconLinks.forEach((link) => {
    if (link.rel === "apple-touch-icon") {
      link.href = appleHref;
      return;
    }
    link.type = "image/png";
    link.href = href;
  });
}

/** Keeps document favicon in sync when brand icon is overridden at runtime. */
export function BrandFavicon() {
  const brand = useBrand();

  useEffect(() => {
    const icon = brand.logos.icon?.trim() || DEFAULT_BRAND.logos.icon;
    const useCustom = icon !== DEFAULT_BRAND.logos.icon;
    const bust = useCustom ? `?v=${encodeURIComponent(brand.logos.icon)}` : `?v=${FAVICON_VERSION}`;

    applyFavicon(useCustom ? `${icon}${bust}` : DEFAULT_ICON, useCustom ? `${icon}${bust}` : DEFAULT_APPLE);
  }, [brand.logos.icon]);

  return null;
}
