"use client";

import { useEffect } from "react";
import { applyThemeToDocument, useThemeStore } from "@/stores/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);

  useEffect(() => {
    applyThemeToDocument(mode, accent);
  }, [mode, accent]);

  return children;
}
