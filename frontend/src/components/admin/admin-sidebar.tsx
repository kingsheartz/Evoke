"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Blocks,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  Files,
  GraduationCap,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MapPin,
  Megaphone,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/app";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  home: Home,
  files: Files,
  "layout-grid": LayoutGrid,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  "shopping-bag": ShoppingBag,
  package: Package,
  "shopping-cart": ShoppingCart,
  plane: Plane,
  "map-pin": MapPin,
  calendar: CalendarDays,
  "calendar-days": CalendarDays,
  "calendar-check": CalendarCheck,
  settings: Settings,
  blocks: Blocks,
  users: Users,
  sliders: SlidersHorizontal,
  megaphone: Megaphone,
};

const childIconByHref: Record<string, LucideIcon> = {
  "/admin/cms/homepage": Home,
  "/admin/cms/divisions": LayoutGrid,
  "/admin/cms/pages": Files,
  "/admin/academy/courses": BookOpen,
  "/admin/academy/enrollments": ClipboardList,
  "/admin/shop/products": Package,
  "/admin/shop/orders": ShoppingCart,
  "/admin/tours/packages": MapPin,
  "/admin/tours/bookings": CalendarCheck,
  "/admin/tasks": CalendarDays,
  "/admin/settings/modules": Blocks,
  "/admin/settings/users": Users,
  "/admin/settings/preferences": SlidersHorizontal,
  "/admin/settings/advertisements": Megaphone,
};

function resolveIcon(name?: string, href?: string): LucideIcon {
  if (name && iconMap[name]) return iconMap[name];
  if (href && childIconByHref[href]) return childIconByHref[href];
  return LayoutDashboard;
}

function navTooltip(groupLabel: string | undefined, label: string) {
  return groupLabel ? `${groupLabel} · ${label}` : label;
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "accent-rail group/link relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        active
          ? "accent-rail-active font-medium text-accent-soft"
          : "text-app-muted hover:bg-white/[0.06] hover:text-app-text",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SectionDivider({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-2 my-2 border-t border-app-border/50" aria-hidden />;
  }
  return null;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { token, navigation, logout, user } = useAuthStore();
  const { collapsed, width, toggleCollapsed, setWidth, getSidebarWidth } = useAdminSidebarStore();
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const [flyout, setFlyout] = useState<{ label: string; top: number; left: number } | null>(null);

  const sidebarWidth = getSidebarWidth();

  useEffect(() => {
    document.documentElement.style.setProperty("--admin-sidebar-width", `${sidebarWidth}px`);
    return () => {
      document.documentElement.style.removeProperty("--admin-sidebar-width");
    };
  }, [sidebarWidth]);

  const showFlyout = useCallback((el: HTMLElement, label: string) => {
    if (!collapsed) return;
    const r = el.getBoundingClientRect();
    setFlyout({ label, top: r.top + r.height / 2, left: r.right + 8 });
  }, [collapsed]);

  const hideFlyout = useCallback(() => setFlyout(null), []);

  const onResizeMove = useCallback(
    (event: MouseEvent) => {
      if (!resizing.current) return;
      const delta = event.clientX - startX.current;
      setWidth(startWidth.current + delta);
    },
    [setWidth],
  );

  const onResizeEnd = useCallback(() => {
    resizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeEnd);
  }, [onResizeMove]);

  const onResizeStart = useCallback(
    (event: React.MouseEvent) => {
      if (collapsed) return;
      event.preventDefault();
      resizing.current = true;
      startX.current = event.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onResizeMove);
      window.addEventListener("mouseup", onResizeEnd);
    },
    [collapsed, width, onResizeMove, onResizeEnd],
  );

  const handleLogout = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        // ignore
      }
    }
    logout();
    window.location.href = "/login";
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <>
      <aside
        data-tour="sidebar"
        className={cn("admin-sidebar", collapsed && "admin-sidebar--collapsed")}
        style={{ width: sidebarWidth }}
      >
        <div className="shrink-0 border-b border-app-border px-4 py-4">
          <div className={cn("flex items-center", collapsed ? "flex-col gap-3" : "justify-between gap-2")}>
            {collapsed ? (
              <Link
                href="/admin"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 font-display text-sm font-bold text-accent-soft ring-1 ring-accent/20"
                title="Dashboard"
                aria-label="Dashboard"
              >
                E
              </Link>
            ) : (
              <div className="min-w-0">
                <Link href="/admin" className="font-display text-lg font-semibold tracking-tight text-app-text">
                  Evoke
                </Link>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-app-muted">
                  Admin Console
                </p>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("shrink-0 text-app-muted hover:text-app-text", collapsed && "h-9 w-9 p-0")}
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="admin-sidebar-nav min-h-0 overflow-y-auto overscroll-y-contain px-3 py-3">
          {navigation.map((item, index) => {
            const Icon = resolveIcon(item.icon, item.href);

            if (item.children?.length) {
              const isSettings = item.label === "Settings";
              return (
                <div
                  key={item.label}
                  data-tour={isSettings ? "settings-nav" : undefined}
                  className={cn("mb-1", !collapsed && index > 0 && "mt-3 border-t border-app-border/60 pt-3")}
                >
                  {index > 0 && collapsed && <SectionDivider collapsed={collapsed} />}
                  {!collapsed && (
                    <div
                      className="accent-rail-header mb-2 flex items-center gap-2 pr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-soft"
                      aria-hidden
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-accent-soft/90" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  )}
                  <ul className="space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = resolveIcon(child.icon, child.href);
                      const active = pathname === child.href || pathname.startsWith(`${child.href}/`);
                      const tip = navTooltip(item.label, child.label);
                      return (
                        <li key={child.href}>
                          {collapsed ? (
                            <Link
                              href={child.href}
                              title={tip}
                              aria-label={tip}
                              onMouseEnter={(e) => showFlyout(e.currentTarget, tip)}
                              onMouseLeave={hideFlyout}
                              onFocus={(e) => showFlyout(e.currentTarget, tip)}
                              onBlur={hideFlyout}
                              className={cn(
                                "accent-rail group/link relative flex items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-all duration-200",
                                active
                                  ? "accent-rail-collapsed-active bg-accent/10 font-medium text-accent-soft"
                                  : "text-app-muted hover:bg-white/[0.06] hover:text-app-text",
                              )}
                            >
                              <ChildIcon className="h-5 w-5 shrink-0" />
                            </Link>
                          ) : (
                            <NavLink
                              href={child.href}
                              label={child.label}
                              icon={ChildIcon}
                              active={active}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }

            if (!item.href) return null;

            return (
              <div key={item.href} className={cn(!collapsed && index > 0 && "mt-1 border-t border-app-border/60 pt-3")}>
                {index > 0 && collapsed && <SectionDivider collapsed={collapsed} />}
                {collapsed ? (
                  <Link
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    onMouseEnter={(e) => showFlyout(e.currentTarget, item.label)}
                    onMouseLeave={hideFlyout}
                    onFocus={(e) => showFlyout(e.currentTarget, item.label)}
                    onBlur={hideFlyout}
                    className={cn(
                      "accent-rail relative flex items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-all duration-200",
                      pathname === item.href
                        ? "accent-rail-collapsed-active bg-accent/10 font-medium text-accent-soft"
                        : "text-app-muted hover:bg-white/[0.06] hover:text-app-text",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </Link>
                ) : (
                  <NavLink
                    href={item.href}
                    label={item.label}
                    icon={Icon}
                    active={pathname === item.href}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer shrink-0 border-t border-app-border bg-[#0a0b0d] p-3 pb-8">
          {user && (
            <div
              className={cn(
                "mb-3 rounded-xl bg-app-surface/80 ring-1 ring-app-border",
                collapsed ? "flex justify-center p-2" : "flex items-center gap-3 px-3 py-2.5",
              )}
              title={collapsed ? `${user.name} (${user.email})` : undefined}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent-soft ring-1 ring-accent/25">
                {userInitial}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">{user.name}</p>
                  <p className="truncate text-xs text-app-muted">{user.email}</p>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-app-muted hover:bg-white/[0.06] hover:text-app-text",
              collapsed ? "mx-auto h-9 w-9 justify-center p-0" : "w-full justify-start",
            )}
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Sign out"}
          </Button>
          <Link
            href="/"
            target="_blank"
            className={cn(
              "mt-2 flex items-center text-xs text-app-muted transition-colors hover:text-accent-soft",
              collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
            )}
            title={collapsed ? "View public site" : undefined}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>View public site</span>}
          </Link>
        </div>

        {!collapsed && (
          <button
            type="button"
            aria-label="Resize sidebar"
            className="admin-sidebar-resize-handle"
            onMouseDown={onResizeStart}
          />
        )}
      </aside>

      {flyout && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[300] -translate-y-1/2 whitespace-nowrap rounded-lg border border-app-border bg-app-surface px-2.5 py-1.5 text-xs font-medium text-app-text shadow-xl"
          style={{ top: flyout.top, left: flyout.left }}
        >
          {flyout.label}
        </div>
      )}
    </>
  );
}
