"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHotkeysHelper } from "@/components/admin/admin-hotkeys-helper";
import { AdminIntroTour } from "@/components/admin/admin-tour";
import { useNotifications } from "@/lib/notifications";
import { apiClient } from "@/lib/api";
import { eventMatchesHotkey, selectEffectiveHotkeys, useAdminPreferencesStore } from "@/stores/admin-preferences";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";
import { useAuthStore } from "@/stores/app";
import { applyThemePreferences } from "@/stores/theme";

export function AdminShellExtras() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const mergeFromServer = useAdminPreferencesStore((s) => s.mergeFromServer);
  const hotkeys = useAdminPreferencesStore(selectEffectiveHotkeys);
  const resetTour = useAdminPreferencesStore((s) => s.resetTour);
  const toggleSidebar = useAdminSidebarStore((s) => s.toggleCollapsed);
  const { info } = useNotifications();
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
    </>
  );
}
