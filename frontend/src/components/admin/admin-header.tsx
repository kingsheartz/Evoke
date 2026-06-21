"use client";

import { AdminTourTrigger } from "@/components/admin/admin-tour";
import { AdminHotkeysTrigger } from "@/components/admin/admin-hotkeys-helper";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { Button } from "@/components/ui/button";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";
import { useAdminPreferencesStore } from "@/stores/admin-preferences";
import { PanelLeft } from "lucide-react";

export function AdminHeader() {
  const toggleCollapsed = useAdminSidebarStore((s) => s.toggleCollapsed);
  const collapsed = useAdminSidebarStore((s) => s.collapsed);
  const resetTour = useAdminPreferencesStore((s) => s.resetTour);

  const startTour = () => {
    resetTour();
    window.dispatchEvent(new CustomEvent("evoke-admin-tour-start"));
  };

  return (
    <header
      data-tour="header"
      className="admin-header z-40 flex h-[var(--app-topbar-height)] shrink-0 items-center justify-between border-b border-app-border glass lg:justify-end"
    >
      <div className="flex items-center lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-app-muted hover:text-app-text"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="admin-header-actions flex items-center gap-2">
        <AdminHotkeysTrigger onClick={() => window.dispatchEvent(new CustomEvent("evoke-admin-hotkeys-open"))} />
        <AdminTourTrigger onClick={startTour} />
        <AdminUserMenu />
      </div>
    </header>
  );
}
