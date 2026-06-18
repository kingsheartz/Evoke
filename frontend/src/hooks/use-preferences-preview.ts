"use client";

import { useEffect, useRef } from "react";
import { useAdminPreferencesStore } from "@/stores/admin-preferences";
import { previewThemeOnDocument, applyThemePreferences, type ThemePreferences } from "@/stores/theme";

type PreviewDraft = {
  notifications: {
    enabled: boolean;
    position: string;
    defaultDurationMs: number;
    showProgressBar: boolean;
    showCountdown: boolean;
  };
  hotkeys: Record<string, string>;
  theme: ThemePreferences;
};

/** Live-preview draft preferences; revert theme/preview on leave if still unsaved. */
export function usePreferencesPreview(
  draft: PreviewDraft | null,
  baseline: string,
  isDirty: boolean,
) {
  const savedRef = useRef<PreviewDraft | null>(null);
  const isDirtyRef = useRef(isDirty);
  const setPreferencesPreview = useAdminPreferencesStore((s) => s.setPreferencesPreview);
  const clearPreferencesPreview = useAdminPreferencesStore((s) => s.clearPreferencesPreview);

  isDirtyRef.current = isDirty;

  useEffect(() => {
    if (!baseline) return;
    try {
      savedRef.current = JSON.parse(baseline) as PreviewDraft;
    } catch {
      savedRef.current = null;
    }
  }, [baseline]);

  useEffect(() => {
    if (!draft) return;
    previewThemeOnDocument(draft.theme);
  }, [draft?.theme.mode, draft?.theme.accent]);

  useEffect(() => {
    if (!draft) return;
    setPreferencesPreview({
      notifications: draft.notifications,
      hotkeys: draft.hotkeys,
    });
  }, [draft, setPreferencesPreview]);

  useEffect(() => {
    return () => {
      if (isDirtyRef.current && savedRef.current) {
        applyThemePreferences(savedRef.current.theme);
      }
      clearPreferencesPreview();
    };
  }, [clearPreferencesPreview]);
}

export function clearPreferencesPreviewState() {
  useAdminPreferencesStore.getState().clearPreferencesPreview();
}
