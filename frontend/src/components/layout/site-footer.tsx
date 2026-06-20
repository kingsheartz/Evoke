"use client";

import Link from "next/link";
import { resolveDivisionIcon } from "@/lib/division-page";
import { CompanyLogo } from "@/components/brand/company-logo";
import { useBrand } from "@/components/providers/brand-provider";
import { PageContainer } from "@/components/layout/app-shell";
import { SiteThemeToggle } from "@/components/theme/site-theme-toggle";
import { useDivisionNav } from "@/hooks/use-division-nav";

export function SiteFooter() {
  const { items: divisions } = useDivisionNav();
  const brand = useBrand();

  return (
    <footer className="relative border-t border-app-border bg-app-surface/50">
      <PageContainer className="py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <CompanyLogo variant="footer" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-app-muted">
              {brand.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-app-muted">Divisions</h4>
            <ul className="mt-4 space-y-3">
              {divisions.map((d) => {
                const Icon = resolveDivisionIcon(d.icon);
                const href = d.public_path ?? `/${d.slug}`;
                return (
                  <li key={d.slug}>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-sm text-app-text transition-colors hover:text-accent-soft"
                    >
                      <Icon className="h-4 w-4 text-accent/60" />
                      {d.nav_label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-app-muted">Account</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/sign-in" className="text-sm text-app-text transition-colors hover:text-accent-soft">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-app-text transition-colors hover:text-accent-soft">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-sm text-app-text transition-colors hover:text-accent-soft">
                  My account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-app-muted">Staff</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/login" className="text-sm text-app-text transition-colors hover:text-accent-soft">
                  Admin portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-app-border pt-8 sm:flex-row">
          <p className="text-xs text-app-muted">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SiteThemeToggle />
            <p className="text-xs text-app-muted">Academy · Shop · Tours</p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
