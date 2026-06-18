"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminHotkeysHelper } from "@/components/admin/admin-hotkeys-helper";
import { AdminIntroTour } from "@/components/admin/admin-tour";
import { useNotifications } from "@/lib/notifications";
import { apiClient, type Advertisement } from "@/lib/api";
import { eventMatchesHotkey, useAdminPreferencesStore } from "@/stores/admin-preferences";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";
import { useAuthStore } from "@/stores/app";
import { applyThemePreferences } from "@/stores/theme";

export function AdminShellExtras() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const mergeFromServer = useAdminPreferencesStore((s) => s.mergeFromServer);
  const hotkeys = useAdminPreferencesStore((s) => s.hotkeys);
  const resetTour = useAdminPreferencesStore((s) => s.resetTour);
  const toggleSidebar = useAdminSidebarStore((s) => s.toggleCollapsed);
  const { info } = useNotifications();
  const [sidebarAd, setSidebarAd] = useState<Advertisement | null>(null);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPreferences(token).then((r) => {
      if (r.data) {
        mergeFromServer(r.data);
        applyThemePreferences(r.data.theme);
      }
    }).catch(() => {});
  }, [token, mergeFromServer]);

  useEffect(() => {
    apiClient.getPublicAds("admin_sidebar").then((r) => {
      setSidebarAd(r.data[0] ?? null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onOpenHotkeys = () => setHotkeysOpen(true);
    window.addEventListener("evoke-admin-hotkeys-open", onOpenHotkeys);
    return () => window.removeEventListener("evoke-admin-hotkeys-open", onOpenHotkeys);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!pathname.startsWith("/admin")) return;

      if (eventMatchesHotkey(event, hotkeys.hotkeys)) {
        event.preventDefault();
        setHotkeysOpen((v) => !v);
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.help)) {
        event.preventDefault();
        resetTour();
        window.dispatchEvent(new CustomEvent("evoke-admin-tour-start"));
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.search)) {
        event.preventDefault();
        const search = document.querySelector<HTMLInputElement>('[data-admin-search="true"]');
        if (search) search.focus();
        else info("Use page filters or open Settings → Users to search accounts.");
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.save)) {
        const active = document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
        event.preventDefault();
        document.querySelector<HTMLButtonElement>('[data-admin-primary-save="true"]')?.click();
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.new)) {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>('[data-admin-new="true"]')?.click();
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.sidebar)) {
        event.preventDefault();
        toggleSidebar();
        return;
      }
      if (eventMatchesHotkey(event, hotkeys.close)) {
        if (hotkeysOpen) {
          event.preventDefault();
          setHotkeysOpen(false);
          return;
        }
        const panel = document.querySelector("[data-admin-detail-panel=true]");
        if (panel) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("evoke-admin-close-panel"));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, hotkeys, resetTour, info, toggleSidebar, hotkeysOpen]);

  if (!pathname.startsWith("/admin")) return null;

  return (
    <>
      <AdminIntroTour />
      <AdminHotkeysHelper open={hotkeysOpen} onClose={() => setHotkeysOpen(false)} />
      {sidebarAd && (
        <div className="admin-sidebar-ad pointer-events-none fixed bottom-20 z-30 hidden lg:block" style={{ left: "1rem", width: "calc(var(--admin-sidebar-width, 260px) - 2rem)" }}>
          <Link
            href={sidebarAd.link_url || "#"}
            target={sidebarAd.link_url ? "_blank" : undefined}
            className="pointer-events-auto block overflow-hidden rounded-xl border border-app-border bg-app-surface/90 ring-1 ring-accent/10 transition hover:ring-accent/30"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sidebarAd.image_url} alt={sidebarAd.title} className="aspect-[16/9] w-full object-cover" />
            {sidebarAd.title && (
              <p className="truncate px-3 py-2 text-xs font-medium text-app-text">{sidebarAd.title}</p>
            )}
          </Link>
        </div>
      )}
    </>
  );
}
