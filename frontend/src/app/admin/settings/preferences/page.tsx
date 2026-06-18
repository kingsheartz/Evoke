"use client";

import { useEffect, useState } from "react";
import { Bell, Keyboard, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { HotkeyInput } from "@/components/admin/hotkey-input";
import { ActionButton } from "@/components/ui/action-button";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import {
  formatHotkeyCombo,
  HOTKEY_CATALOG,
  useAdminPreferencesStore,
  type NotificationPosition,
} from "@/stores/admin-preferences";
import { useAuthStore } from "@/stores/app";
import { applyThemePreferences, getThemePreferences } from "@/stores/theme";
import { cn } from "@/lib/utils";

const POSITIONS: { value: NotificationPosition; label: string }[] = [
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
];

function SettingRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-app-border/50 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1 sm:max-w-xl">
        <p className="text-sm font-medium text-app-text">{label}</p>
        {description && <p className="mt-0.5 text-sm text-app-muted">{description}</p>}
      </div>
      <div className="w-full shrink-0 sm:w-52">{children}</div>
    </div>
  );
}

export default function PreferencesSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error, info } = useNotifications();
  const notifications = useAdminPreferencesStore((s) => s.notifications);
  const hotkeys = useAdminPreferencesStore((s) => s.hotkeys);
  const setNotifications = useAdminPreferencesStore((s) => s.setNotifications);
  const setHotkey = useAdminPreferencesStore((s) => s.setHotkey);
  const resetTour = useAdminPreferencesStore((s) => s.resetTour);
  const mergeFromServer = useAdminPreferencesStore((s) => s.mergeFromServer);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPreferences(token).then((r) => {
      if (r.data) {
        mergeFromServer(r.data);
        applyThemePreferences(r.data.theme);
      }
    }).catch(() => {});
  }, [token, mergeFromServer]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiClient.updateAdminPreferences(token, {
        notifications,
        hotkeys,
        tour: { autoStart: false },
        theme: getThemePreferences(),
      });
      success("Preferences saved.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="Admin Preferences"
        description="Theme, notifications, keyboard shortcuts, and intro tour"
        actions={
          <ActionButton icon={Save} loading={saving} data-admin-primary-save="true" onClick={save}>
            Save preferences
          </ActionButton>
        }
      />

      <Tabs defaultValue="theme">
        <TabsList>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="hotkeys">
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="tour">
            <Sparkles className="h-4 w-4" />
            Intro tour
          </TabsTrigger>
        </TabsList>

        <TabsPanel>
          <TabsContent value="theme">
            <p className="border-b border-app-border/50 pb-4 text-sm text-app-muted">
              Choose light or dark mode and an accent color for the admin panel and public site.
              Changes apply immediately; save to sync across devices.
            </p>
            <div className="py-4">
              <ThemeSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
              <SettingRow label="Enable notifications" description="Show toast messages in the admin panel">
                <Switch checked={notifications.enabled} onCheckedChange={(v) => setNotifications({ enabled: v })} />
              </SettingRow>
              <SettingRow label="Position" description="Where toasts appear on screen">
                <Select
                  value={notifications.position}
                  onChange={(e) => setNotifications({ position: e.target.value as NotificationPosition })}
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </SettingRow>
              <SettingRow
                label="Duration"
                description={`Auto-dismiss after ${notifications.defaultDurationMs / 1000} seconds`}
              >
                <input
                  type="range"
                  min={2}
                  max={15}
                  step={1}
                  value={Math.round(notifications.defaultDurationMs / 1000)}
                  onChange={(e) => setNotifications({ defaultDurationMs: Number(e.target.value) * 1000 })}
                  className="w-full accent-accent"
                />
              </SettingRow>
              <SettingRow label="Progress bar" description="Show animated time remaining">
                <Switch
                  checked={notifications.showProgressBar}
                  onCheckedChange={(v) => setNotifications({ showProgressBar: v })}
                />
              </SettingRow>
              <SettingRow label="Countdown" description="Show numeric seconds on each toast">
                <Switch
                  checked={notifications.showCountdown}
                  onCheckedChange={(v) => setNotifications({ showCountdown: v })}
                />
              </SettingRow>
              <div className="py-4">
                <ActionButton variant="outline" size="sm" onClick={() => info("This is a preview of your notification settings.")}>
                  Preview notification
                </ActionButton>
              </div>
            </TabsContent>

            <TabsContent value="hotkeys">
              <p className="border-b border-app-border/50 pb-4 text-sm text-app-muted">
                Click a field and press keys to record. Press{" "}
                <span className="font-mono text-accent-soft">{formatHotkeyCombo(hotkeys.hotkeys)}</span> or use
                Shortcuts in the header to open the helper panel.
              </p>
              {HOTKEY_CATALOG.map((item) => (
                <SettingRow key={item.key} label={item.label} description={item.description}>
                  <HotkeyInput value={hotkeys[item.key]} onChange={(v) => setHotkey(item.key, v)} />
                </SettingRow>
              ))}
            </TabsContent>

            <TabsContent value="tour">
              <SettingRow
                label="Guided walkthrough"
                description={`Walks through sidebar, settings, and workspace. Press ${formatHotkeyCombo(hotkeys.help)} or use the Tour button in the header.`}
              >
                <ActionButton
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  className="w-full"
                  onClick={() => {
                    resetTour();
                    window.dispatchEvent(new CustomEvent("evoke-admin-tour-start"));
                  }}
                >
                  Start tour
                </ActionButton>
              </SettingRow>
              <p className="py-4 text-sm text-app-muted">
                The tour never starts automatically. You can replay it anytime from here or the admin header.
              </p>
          </TabsContent>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
