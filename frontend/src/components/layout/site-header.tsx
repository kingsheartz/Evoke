import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="absolute z-30 w-full">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-app-text">
          Evoke
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/academy"
            className="text-sm font-medium text-app-muted transition-colors hover:text-app-text"
          >
            Academy
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-app-muted transition-colors hover:text-app-text"
          >
            Sports Shop
          </Link>
          <Link
            href="/tours"
            className="text-sm font-medium text-app-muted transition-colors hover:text-app-text"
          >
            Tours & Travels
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-accent hover:text-accent-soft">
            <Link href="/login">Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
