"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Keyboard, X } from "lucide-react";
import {
  formatHotkeyCombo,
  HOTKEY_CATALOG,
  selectEffectiveHotkeys,
  useAdminPreferencesStore,
} from "@/stores/admin-preferences";

export function AdminHotkeysHelper({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const hotkeys = useAdminPreferencesStore(selectEffectiveHotkeys);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483640] flex items-start justify-center bg-black/70 p-4 pt-[calc(var(--app-topbar-height)+1rem)]"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-app-border bg-app-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-accent-soft" />
            <h2 className="text-base font-semibold text-app-text">Keyboard shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-app-muted hover:bg-white/5 hover:text-app-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto p-2">
          <table className="w-full text-sm">
            <tbody>
              {HOTKEY_CATALOG.map((item) => (
                <tr key={item.key} className="border-b border-app-border/50 last:border-0">
                  <td className="px-3 py-3 align-top">
                    <p className="font-medium text-app-text">{item.label}</p>
                    <p className="mt-0.5 text-xs text-app-muted">{item.description}</p>
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <kbd className="inline-flex min-w-[5rem] justify-center rounded-md border border-app-border bg-app-surface-muted/60 px-2 py-1 font-mono text-xs text-accent-soft">
                      {formatHotkeyCombo(hotkeys[item.key])}
                    </kbd>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-app-border px-5 py-3 text-xs text-app-muted">
          Customize shortcuts in Settings → Preferences. Press{" "}
          <kbd className="rounded border border-app-border px-1 font-mono">{formatHotkeyCombo(hotkeys.hotkeys)}</kbd>{" "}
          anytime to reopen this panel.
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AdminHotkeysTrigger({ onClick }: { onClick: () => void }) {
  const hotkeys = useAdminPreferencesStore(selectEffectiveHotkeys);
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface/80 px-3 py-1.5 text-xs text-app-muted transition-all hover:border-accent/30 hover:text-accent-soft"
      title={`Keyboard shortcuts (${formatHotkeyCombo(hotkeys.hotkeys)})`}
    >
      <Keyboard className="h-3 w-3" />
      Shortcuts
    </button>
  );
}
