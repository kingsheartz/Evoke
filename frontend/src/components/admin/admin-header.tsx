"use client";

import Link from "next/link";
import { ExternalLink, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";

export function AdminHeader() {
  const toggleCollapsed = useAdminSidebarStore((s) => s.toggleCollapsed);
  const collapsed = useAdminSidebarStore((s) => s.collapsed);

  return (
    <header className="app-shell-x z-40 flex h-[var(--app-topbar-height)] shrink-0 items-center justify-between border-b border-app-border glass">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-app-muted hover:text-app-text lg:hidden"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-app-muted">Evoke Admin</span>
      </div>
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface/80 px-3 py-1.5 text-xs text-app-muted transition-all hover:border-accent/30 hover:text-accent-soft"
      >
        View site
        <ExternalLink className="h-3 w-3" />
      </Link>
    </header>
  );
}
