"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Keyboard, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { HotkeyInput } from "@/components/admin/hotkey-input";
import { ActionButton } from "@/components/ui/action-button";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { clearPreferencesPreviewState, usePreferencesPreview } from "@/hooks/use-preferences-preview";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import {
  DEFAULT_ADMIN_PREFERENCES,
  formatHotkeyCombo,
  HOTKEY_CATALOG,
  useAdminPreferencesStore,
  type AdminHotkeyKey,
  type AdminHotkeys,
  type NotificationPosition,
} from "@/stores/admin-preferences";
import { useAuthStore } from "@/stores/app";
import { applyThemePreferences, getThemePreferences, type ThemePreferences } from "@/stores/theme";
import { cn } from "@/lib/utils";

const POSITIONS: { value: NotificationPosition; label: string }[] = [
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
];

type PreferencesDraft = {
  notifications: typeof DEFAULT_ADMIN_PREFERENCES.notifications;
  hotkeys: AdminHotkeys;
  theme: ThemePreferences;
};

function buildDraft(server?: {
  notifications?: Partial<PreferencesDraft["notifications"]> & { position?: string };
  hotkeys?: Partial<AdminHotkeys>;
  theme?: Partial<ThemePreferences>;
} | null): PreferencesDraft {
  const validPositions: NotificationPosition[] = [
    "top-right", "top-left", "bottom-right", "bottom-left", "top-center", "bottom-center",
  ];
  const position =
    server?.notifications?.position && validPositions.includes(server.notifications.position as NotificationPosition)
      ? (server.notifications.position as NotificationPosition)
      : DEFAULT_ADMIN_PREFERENCES.notifications.position;

  const themeFromServer = server?.theme;
  const fallbackTheme = getThemePreferences();

  return {
    notifications: {
      ...DEFAULT_ADMIN_PREFERENCES.notifications,
      ...server?.notifications,
      position,
    },
    hotkeys: {
      ...DEFAULT_ADMIN_PREFERENCES.hotkeys,
      ...server?.hotkeys,
    },
    theme: {
      mode: themeFromServer?.mode ?? fallbackTheme.mode,
      accent: themeFromServer?.accent ?? fallbackTheme.accent,
    },
  };
}

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
  const { success, error, preview } = useNotifications();
  const errorRef = useRef(error);
  errorRef.current = error;
  const mergeFromServer = useAdminPreferencesStore((s) => s.mergeFromServer);
  const resetTour = useAdminPreferencesStore((s) => s.resetTour);
  const [draft, setDraft] = useState<PreferencesDraft | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminPreferences(token)
      .then((r) => {
        const next = buildDraft(r.data);
        setDraft(next);
        setBaseline(JSON.stringify(next));
      })
      .catch(() => errorRef.current("Could not load preferences."))
      .finally(() => setLoading(false));
  }, [token]);

  const isDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  useUnsavedChangesWarning(isDirty);
  usePreferencesPreview(draft, baseline, isDirty);

  const patchDraft = (patch: Partial<PreferencesDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const save = async () => {
    if (!token || !draft) return;
    setSaving(true);
    try {
      await apiClient.updateAdminPreferences(token, {
        notifications: draft.notifications,
        hotkeys: draft.hotkeys,
        tour: { autoStart: false },
        theme: draft.theme,
      });
      mergeFromServer(draft);
      applyThemePreferences(draft.theme);
      clearPreferencesPreviewState();
      setBaseline(JSON.stringify(draft));
      success("Preferences saved.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="app-page">
        <PageHeader title="Admin Preferences" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <PageHeader
        title="Admin Preferences"
        description={
          isDirty
            ? "Previewing unsaved changes — save to keep them, or leave to revert."
            : "Theme, notifications, keyboard shortcuts, and intro tour."
        }
        actions={
          <ActionButton
            icon={Save}
            loading={saving}
            disabled={!isDirty && !saving}
            data-admin-primary-save="true"
            onClick={save}
          >
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
              Choose light or dark mode and an accent color. You&apos;ll see changes immediately as a preview;
              save to keep them (or press{" "}
              <kbd className="rounded bg-app-surface-muted px-1.5 py-0.5 text-xs">Ctrl+S</kbd>).
            </p>
            <div className="py-4">
              <ThemeSettings value={draft.theme} onChange={(theme) => patchDraft({ theme })} />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <SettingRow label="Enable notifications" description="Show toast messages in the admin panel">
              <Switch
                checked={draft.notifications.enabled}
                onCheckedChange={(v) =>
                  patchDraft({ notifications: { ...draft.notifications, enabled: v } })
                }
              />
            </SettingRow>
            <SettingRow label="Position" description="Where toasts appear on screen">
              <Select
                value={draft.notifications.position}
                onChange={(e) =>
                  patchDraft({
                    notifications: {
                      ...draft.notifications,
                      position: e.target.value as NotificationPosition,
                    },
                  })
                }
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow
              label="Duration"
              description={`Auto-dismiss after ${draft.notifications.defaultDurationMs / 1000} seconds`}
            >
              <input
                type="range"
                min={2}
                max={15}
                step={1}
                value={Math.round(draft.notifications.defaultDurationMs / 1000)}
                onChange={(e) =>
                  patchDraft({
                    notifications: {
                      ...draft.notifications,
                      defaultDurationMs: Number(e.target.value) * 1000,
                    },
                  })
                }
                className="w-full accent-accent"
              />
            </SettingRow>
            <SettingRow label="Progress bar" description="Show animated time remaining">
              <Switch
                checked={draft.notifications.showProgressBar}
                onCheckedChange={(v) =>
                  patchDraft({ notifications: { ...draft.notifications, showProgressBar: v } })
                }
              />
            </SettingRow>
            <SettingRow label="Countdown" description="Show numeric seconds on each toast">
              <Switch
                checked={draft.notifications.showCountdown}
                onCheckedChange={(v) =>
                  patchDraft({ notifications: { ...draft.notifications, showCountdown: v } })
                }
              />
            </SettingRow>
            <div className="py-4">
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => preview("This is a preview of your notification settings.")}
              >
                Preview notification
              </ActionButton>
            </div>
          </TabsContent>

          <TabsContent value="hotkeys">
            <p className="border-b border-app-border/50 pb-4 text-sm text-app-muted">
              Click a field and press keys to record. Press{" "}
              <span className="font-mono text-accent-soft">{formatHotkeyCombo(draft.hotkeys.hotkeys)}</span> or use
              Shortcuts in the header to open the helper panel.
            </p>
            {HOTKEY_CATALOG.map((item) => (
              <SettingRow key={item.key} label={item.label} description={item.description}>
                <HotkeyInput
                  value={draft.hotkeys[item.key]}
                  onChange={(v) =>
                    patchDraft({
                      hotkeys: { ...draft.hotkeys, [item.key as AdminHotkeyKey]: v },
                    })
                  }
                />
              </SettingRow>
            ))}
          </TabsContent>

          <TabsContent value="tour">
            <SettingRow
              label="Guided walkthrough"
              description={`Walks through sidebar, settings, and workspace. Press ${formatHotkeyCombo(draft.hotkeys.help)} or use the Tour button in the header.`}
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
