"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ExternalLink,
  LogOut,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { UserAvatar } from "@/components/admin/user-detail-panel";
import { apiClient } from "@/lib/api";
import { formatRole } from "@/lib/status-labels";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/app";

function MenuItem({
  href,
  icon: Icon,
  label,
  external,
  onClick,
}: {
  href?: string;
  icon: typeof User;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-app-text transition-colors hover:bg-app-surface-muted";

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
        onClick={onClick}
      >
        <Icon className="h-4 w-4 shrink-0 text-app-muted" aria-hidden />
        <span className="flex-1 text-left">{label}</span>
        {external ? (
          <ExternalLink className="h-3.5 w-3.5 text-app-muted" aria-hidden />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-app-muted" aria-hidden />
        )}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <Icon className="h-4 w-4 shrink-0 text-app-muted" aria-hidden />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

export function AdminUserMenu() {
  const router = useRouter();
  const { user, token, roles, logout } = useAuthStore();
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
    const width = 280;
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
    setMenuStyle({ top: rect.bottom + 8, left, width });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    syncPosition();
    requestAnimationFrame(syncPosition);
  }, [open, syncPosition]);

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

  const handleSignOut = async () => {
    setOpen(false);
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        /* ignore */
      }
    }
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const primaryRole = roles[0] ? formatRole(roles[0]) : "Staff";

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
              <p className="truncate text-sm font-semibold text-app-text">{user.name}</p>
              <p className="truncate text-xs text-app-muted">{user.email}</p>
              <p className="mt-1.5 inline-flex rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-soft">
                {primaryRole}
              </p>
            </div>

            <div className="space-y-0.5 p-2">
              <MenuItem href="/account" icon={User} label="My account" onClick={() => setOpen(false)} />
              <MenuItem
                href="/admin/settings/preferences"
                icon={SlidersHorizontal}
                label="Preferences"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                href="/"
                icon={ExternalLink}
                label="View public site"
                external
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="border-t border-app-border p-2">
              <MenuItem icon={LogOut} label="Sign out" onClick={handleSignOut} />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={rootRef} className="relative flex shrink-0 items-center">
        <button
          ref={triggerRef}
          type="button"
          suppressHydrationWarning
          className={cn(
            "admin-user-menu-trigger inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-0 ring-1 ring-app-border transition-colors hover:bg-app-surface-muted hover:ring-accent/30",
            open && "bg-app-surface-muted ring-accent/30",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`${user.name} account menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <UserAvatar user={user} size="sm" className="h-full w-full ring-0" />
        </button>
      </div>
      {menu}
    </>
  );
}
