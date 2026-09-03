import type { MetadataRoute } from "next";
import { DEFAULT_BRAND } from "@/lib/brand-defaults";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_BRAND.name,
    short_name: "Evoke",
    description: DEFAULT_BRAND.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
