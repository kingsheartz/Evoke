import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
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
    default: "Evoke — Academy · Sports Shop · Tours & Travels",
    template: "%s | Evoke",
  },
  description:
    "Premium multi-business platform offering academy courses, sports equipment, and travel packages.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Evoke",
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
    >
      <body className="flex min-h-full flex-col bg-app-bg font-sans tracking-tight text-app-text">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
