"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, type AdPlacement, type Advertisement } from "@/lib/api";

export function SiteAdBanner({ placement }: { placement: AdPlacement }) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    apiClient.getPublicAds(placement).then((r) => setAds(r.data)).catch(() => setAds([]));
  }, [placement]);

  if (ads.length === 0) return null;

  const ad = ads[0];
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover" />
      {ad.title && placement !== "site_header" && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-medium text-white">
          {ad.title}
        </span>
      )}
    </>
  );

  const className =
    placement === "site_header"
      ? "relative block h-10 overflow-hidden md:h-12"
      : placement === "footer"
        ? "relative block aspect-[6/1] overflow-hidden rounded-lg"
        : "relative block aspect-[21/9] overflow-hidden rounded-2xl";

  if (ad.link_url) {
    return (
      <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
