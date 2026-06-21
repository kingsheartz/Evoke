"use client";

import { EvokeLogo } from "@/components/brand/evoke-logo";
import { AdminSettingsMenu } from "@/components/admin/admin-settings-menu";
import { UserAvatar } from "@/components/admin/user-detail-panel";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Blocks,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Files,
  GraduationCap,
  Home,
  LayoutDashboard,
  LayoutGrid,
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
import { useAdminSidebarHydrated } from "@/hooks/use-admin-sidebar-hydration";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import {
  DEFAULT_WIDTH,
  syncAdminSidebarWidthVar,
  useAdminSidebarStore,
} from "@/stores/admin-sidebar";

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
  "/admin/academy/trainers": Users,
  "/admin/shop/products": Package,
  "/admin/shop/orders": ShoppingCart,
  "/admin/tours/packages": MapPin,
  "/admin/tours/bookings": CalendarCheck,
  "/admin/tasks": CalendarDays,
  "/admin/settings/modules": Blocks,
  "/admin/settings/users": Users,
  "/admin/settings/brand": SlidersHorizontal,
  "/admin/settings/preferences": SlidersHorizontal,
  "/admin/settings/advertisements": Megaphone,
};

function resolveIcon(name?: string, href?: string): LucideIcon {
  if (name && iconMap[name]) return iconMap[name];
  if (href && childIconByHref[href]) return childIconByHref[href];
  return LayoutDashboard;
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActiveChild(pathname: string, item: NavItem) {
  return item.children?.some((child) => isRouteActive(pathname, child.href)) ?? false;
}

function buildOpenGroups(navigation: NavItem[]) {
  const open: Record<string, boolean> = {};
  for (const item of navigation) {
    if (item.children?.length && item.label !== "Settings") {
      open[item.label] = true;
    }
  }
  return open;
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
        "admin-nav-link group/link relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        active ? "admin-nav-link--active" : "text-app-muted hover:text-app-text",
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

type GroupFlyout = {
  label: string;
  items: { label: string; href: string; icon: LucideIcon }[];
  top: number;
  left: number;
};

function CollapsibleNavGroup({
  item,
  index,
  collapsed,
  pathname,
  open,
  onToggle,
  showLinkFlyout,
  hideFlyout,
  openGroupFlyout,
  dataTour,
  showTopBorder = true,
}: {
  item: NavItem;
  index: number;
  collapsed: boolean;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  showLinkFlyout: (el: HTMLElement, label: string) => void;
  hideFlyout: () => void;
  openGroupFlyout: (el: HTMLElement, item: NavItem) => void;
  dataTour?: string;
  showTopBorder?: boolean;
}) {
  const Icon = resolveIcon(item.icon, item.href);
  const children = item.children ?? [];

  return (
    <div
      data-tour={dataTour}
      className={cn("mb-1", !collapsed && showTopBorder && index > 0 && "mt-3 border-t border-app-border/60 pt-3")}
    >
      {index > 0 && collapsed && <SectionDivider collapsed={collapsed} />}
      {collapsed ? (
        <button
          type="button"
          title={item.label}
          aria-label={item.label}
          aria-expanded={open}
          onClick={(e) => openGroupFlyout(e.currentTarget, item)}
          onMouseEnter={(e) => showLinkFlyout(e.currentTarget, item.label)}
          onMouseLeave={hideFlyout}
          className={cn(
            "admin-nav-link relative flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-all duration-200",
            groupHasActiveChild(pathname, item)
              ? "admin-nav-link--active"
              : "text-app-muted hover:text-app-text",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="accent-rail-header mb-2 flex w-full items-center gap-2 pr-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-soft transition-colors hover:text-accent"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-accent-soft/90" />
            <span className="truncate">{item.label}</span>
            <ChevronDown
              className={cn(
                "ml-auto h-3.5 w-3.5 shrink-0 text-accent-soft/70 transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {open && (
            <ul className="space-y-1">
              {children.map((child) => {
                const ChildIcon = resolveIcon(child.icon, child.href);
                const active = isRouteActive(pathname, child.href);
                return (
                  <li key={child.href}>
                    <NavLink href={child.href} label={child.label} icon={ChildIcon} active={active} />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { navigation, user } = useAuthStore();
  const sidebarHydrated = useAdminSidebarHydrated();
  const authHydrated = useAuthHydrated();
  const { collapsed, width, toggleCollapsed, setWidth, getSidebarWidth } = useAdminSidebarStore();
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const [linkFlyout, setLinkFlyout] = useState<{ label: string; top: number; left: number } | null>(null);
  const [groupFlyout, setGroupFlyout] = useState<GroupFlyout | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => buildOpenGroups(navigation));

  const { mainNavigation, settingsLinks } = useMemo(() => {
    const settings = navigation.find((item) => item.label === "Settings");
    const promotedHrefs = new Set(["/admin/settings/advertisements", "/admin/settings/users"]);
    const settingsChildren = settings?.children ?? [];

    const promotedFromSettings = settingsChildren.filter((child) => promotedHrefs.has(child.href));
    const menuChildren = settingsChildren.filter((child) => !promotedHrefs.has(child.href));

    let main = navigation.filter((item) => item.label !== "Settings");

    for (const child of promotedFromSettings) {
      if (!main.some((item) => item.href === child.href)) {
        main = [
          ...main,
          { label: child.label, href: child.href, icon: child.icon, visible: true },
        ];
      }
    }

    return {
      mainNavigation: main,
      settingsLinks: menuChildren.map((child) => ({
        label: child.label,
        href: child.href,
        icon: resolveIcon(child.icon, child.href),
      })),
    };
  }, [navigation]);

  const sidebarWidth = sidebarHydrated ? getSidebarWidth() : DEFAULT_WIDTH;
  const sidebarCollapsed = sidebarHydrated && collapsed;

  useLayoutEffect(() => {
    syncAdminSidebarWidthVar(sidebarHydrated ? getSidebarWidth() : DEFAULT_WIDTH);
  }, [sidebarHydrated, collapsed, width, getSidebarWidth]);

  useEffect(() => {
    return useAdminSidebarStore.subscribe((state, prev) => {
      if (state.collapsed === prev.collapsed && state.width === prev.width) return;
      syncAdminSidebarWidthVar(state.getSidebarWidth());
    });
  }, []);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of navigation) {
        if (item.label === "Settings") continue;
        if (item.children?.length && next[item.label] === undefined) {
          next[item.label] = true;
        }
      }
      return next;
    });
  }, [navigation]);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const showLinkFlyout = useCallback(
    (el: HTMLElement, label: string) => {
      if (!collapsed) return;
      const r = el.getBoundingClientRect();
      setLinkFlyout({ label, top: r.top + r.height / 2, left: r.right + 8 });
    },
    [collapsed],
  );

  const hideFlyout = useCallback(() => {
    setLinkFlyout(null);
  }, []);

  const openGroupFlyout = useCallback((el: HTMLElement, item: NavItem) => {
    const r = el.getBoundingClientRect();
    setGroupFlyout({
      label: item.label,
      items: (item.children ?? []).map((child) => ({
        label: child.label,
        href: child.href,
        icon: resolveIcon(child.icon, child.href),
      })),
      top: r.top + r.height / 2,
      left: r.right + 8,
    });
    setLinkFlyout(null);
  }, []);

  useEffect(() => {
    if (!groupFlyout) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".admin-sidebar-group-flyout")) return;
      setGroupFlyout(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [groupFlyout]);

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

  return (
    <>
      <aside
        data-tour="sidebar"
        className={cn("admin-sidebar", sidebarCollapsed && "admin-sidebar--collapsed")}
        style={{ width: sidebarWidth }}
      >
        <div className="shrink-0 border-b border-app-border px-4 py-4 admin-sidebar-header">
          <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-3" : "justify-between gap-2")}>
            <EvokeLogo variant="admin-icon" href="/admin" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "hidden shrink-0 text-app-muted hover:text-app-text lg:inline-flex",
                sidebarCollapsed ? "h-9 w-9 justify-center p-0" : "h-9 px-2",
              )}
              onClick={toggleCollapsed}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="admin-sidebar-nav min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3">
          {mainNavigation.map((item, index) => {
            const Icon = resolveIcon(item.icon, item.href);

            if (item.children?.length) {
              return (
                <CollapsibleNavGroup
                  key={item.label}
                  item={item}
                  index={index}
                  collapsed={sidebarCollapsed}
                  pathname={pathname}
                  open={openGroups[item.label] ?? true}
                  onToggle={() => toggleGroup(item.label)}
                  showLinkFlyout={showLinkFlyout}
                  hideFlyout={hideFlyout}
                  openGroupFlyout={openGroupFlyout}
                />
              );
            }

            if (!item.href) return null;

            return (
              <div key={item.href} className={cn(!sidebarCollapsed && index > 0 && "mt-1 border-t border-app-border/60 pt-3")}>
                {index > 0 && sidebarCollapsed && <SectionDivider collapsed={sidebarCollapsed} />}
                {sidebarCollapsed ? (
                  <Link
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    onMouseEnter={(e) => showLinkFlyout(e.currentTarget, item.label)}
                    onMouseLeave={hideFlyout}
                    onFocus={(e) => showLinkFlyout(e.currentTarget, item.label)}
                    onBlur={hideFlyout}
                    className={cn(
                      "admin-nav-link relative flex items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-all duration-200",
                      isRouteActive(pathname, item.href)
                        ? "admin-nav-link--active"
                        : "text-app-muted hover:text-app-text",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </Link>
                ) : (
                  <NavLink
                    href={item.href}
                    label={item.label}
                    icon={Icon}
                    active={isRouteActive(pathname, item.href)}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer mt-auto shrink-0 border-t border-app-border px-3 py-3">
          <AdminSettingsMenu items={settingsLinks} sidebarCollapsed={sidebarCollapsed} />
          {authHydrated && user && (
            <div
              className={cn(
                "mt-2 rounded-xl bg-app-surface ring-1 ring-app-border",
                sidebarCollapsed ? "flex justify-center p-2" : "flex items-center gap-3 px-3 py-2.5",
              )}
              title={sidebarCollapsed ? `${user.name} (${user.email})` : undefined}
            >
              <UserAvatar user={user} size="sm" />
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">{user.name}</p>
                  <p className="truncate text-xs text-app-muted">{user.email}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <button
            type="button"
            aria-label="Resize sidebar"
            className="admin-sidebar-resize-handle"
            onMouseDown={onResizeStart}
          />
        )}
      </aside>

      {linkFlyout && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[300] -translate-y-1/2 whitespace-nowrap rounded-lg border border-app-border bg-app-surface px-2.5 py-1.5 text-xs font-medium text-app-text shadow-xl"
          style={{ top: linkFlyout.top, left: linkFlyout.left }}
        >
          {linkFlyout.label}
        </div>
      )}

      {groupFlyout && (
        <div
          className="admin-sidebar-group-flyout fixed z-[300] min-w-40 -translate-y-1/2 rounded-lg border border-app-border bg-app-surface py-1 shadow-xl"
          style={{ top: groupFlyout.top, left: groupFlyout.left }}
          onMouseLeave={() => setGroupFlyout(null)}
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-soft">
            {groupFlyout.label}
          </p>
          <ul>
            {groupFlyout.items.map((child) => {
              const ChildIcon = child.icon;
              const active = isRouteActive(pathname, child.href);
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={() => setGroupFlyout(null)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                      active ? "bg-accent/10 text-accent-soft" : "text-app-text hover:bg-app-surface-muted",
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
