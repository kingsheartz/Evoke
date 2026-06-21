"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function MenuItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-app-text transition-colors hover:bg-app-surface-muted"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0 text-app-muted" aria-hidden />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-app-muted" aria-hidden />
    </Link>
  );
}

type AdminSettingsMenuProps = {
  items: SettingsLink[];
  sidebarCollapsed?: boolean;
};

export function AdminSettingsMenu({ items, sidebarCollapsed = false }: AdminSettingsMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const syncPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 260);
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    setMenuStyle({
      top: Math.max(8, rect.top - menuHeight - 8),
      left: rect.left,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    syncPosition();
    requestAnimationFrame(syncPosition);
  }, [open, syncPosition, items.length]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => syncPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, syncPosition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  const active = items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const menu =
    open && menuStyle && mounted
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="admin-user-menu-dropdown"
            style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
          >
            <div className="border-b border-app-border px-4 py-3">
              <p className="text-sm font-semibold text-app-text">Settings</p>
              <p className="text-xs text-app-muted">Brand, preferences, and modules</p>
            </div>
            <div className="space-y-0.5 p-2">
              {items.map((item) => (
                <MenuItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={rootRef} className="relative w-full" data-tour="settings-nav">
        <button
          ref={triggerRef}
          type="button"
          suppressHydrationWarning
          className={cn(
            "admin-user-menu-trigger flex w-full items-center gap-3 rounded-xl bg-app-surface px-3 py-2.5 ring-1 ring-app-border transition-colors hover:bg-app-surface-muted",
            sidebarCollapsed && "justify-center px-2",
            open && "bg-app-surface-muted",
            active && "ring-accent/40",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
          title={sidebarCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0 text-app-muted" aria-hidden />
          {!sidebarCollapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-app-text">
                Settings
              </span>
              <ChevronRight
                className={cn("h-4 w-4 shrink-0 text-app-muted transition-transform", open && "rotate-90")}
                aria-hidden
              />
            </>
          )}
        </button>
      </div>
      {menu}
    </>
  );
}
