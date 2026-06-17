"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/app";

function titleFromPath(pathname: string): string {
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  return segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" · ");
}

export function AdminHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = titleFromPath(pathname);

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-app-border bg-app-bg/90 px-8 backdrop-blur"
      style={{ height: "var(--app-topbar-height)" }}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Admin</p>
        <h2 className="text-sm font-semibold text-app-text">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-app-muted transition-colors hover:text-accent-soft"
        >
          View site
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-app-text">{user.name}</p>
            <p className="text-xs text-app-muted">{user.email}</p>
          </div>
        )}
      </div>
    </header>
  );
}
