"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteAuthActions } from "@/components/layout/site-auth-actions";
import { PageContainer } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

const links = [
  { href: "/academy", label: "Academy" },
  { href: "/shop", label: "Sports Shop" },
  { href: "/tours", label: "Tours & Travels" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

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
  return (
    <header
      className={cn(
        "fixed z-50 w-full transition-all duration-300",
        scrolled ? "glass border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent",
      )}
    >
      <PageContainer className="flex h-[4.5rem] items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
        >
          Evoke
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-white"
                  : "text-white/85 hover:text-white",
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SiteAuthActions className="hidden items-center gap-2 md:flex" />
          <MobileNav />
        </div>
      </PageContainer>
    </header>
  );
}
