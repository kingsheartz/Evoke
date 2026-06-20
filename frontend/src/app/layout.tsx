import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeInitScript } from "@/components/providers/theme-init-script";
import { DEFAULT_BRAND } from "@/lib/brand-defaults";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${DEFAULT_BRAND.name} — EVOKE Academy · EOKE Sports · EVOKE Tours`,
    template: `%s | ${DEFAULT_BRAND.name}`,
  },
  description: DEFAULT_BRAND.description,
  // Favicon: app/icon.png + app/apple-icon.png (Next.js file conventions). Do not set icons here —
  // explicit /favicon.ico metadata can pin a stale hashed asset from .next/dev.
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: DEFAULT_BRAND.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col bg-app-bg font-sans tracking-tight text-app-text">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
