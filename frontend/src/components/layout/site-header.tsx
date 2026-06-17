import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Evoke
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/academy" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Academy
          </Link>
          <Link href="/shop" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Sports Shop
          </Link>
          <Link href="/tours" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Tours & Travels
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
