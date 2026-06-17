import Link from "next/link";
import { GraduationCap, Plane, ShoppingBag } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";

const divisions = [
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/shop", label: "Sports Shop", icon: ShoppingBag },
  { href: "/tours", label: "Tours & Travels", icon: Plane },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-app-border bg-app-surface/50">
      <PageContainer className="py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl font-semibold text-app-text">
              Evoke
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-app-muted">
              A premium multi-business platform uniting world-class academy training,
              curated sports equipment, and unforgettable travel experiences.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-app-muted">Divisions</h4>
            <ul className="mt-4 space-y-3">
              {divisions.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    className="inline-flex items-center gap-2 text-sm text-app-text transition-colors hover:text-accent-soft"
                  >
                    <d.icon className="h-4 w-4 text-accent/60" />
                    {d.label}
                  </Link>
                </li>
              ))}
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
            © {new Date().getFullYear()} Evoke Platform. All rights reserved.
          </p>
          <p className="text-xs text-app-muted">
            Crafted with precision · Academy · Shop · Tours
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
