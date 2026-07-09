"use client";

import { EvokeLogo } from "@/components/brand/evoke-logo";
import { AdminSettingsMenu } from "@/components/admin/admin-settings-menu";
import { UserAvatar } from "@/components/admin/user-detail-panel";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Award,
  Blocks,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  Files,
  GraduationCap,
  Home,
  Image,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MapPin,
  Megaphone,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Ticket,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminMobile } from "@/hooks/use-admin-mobile";
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
  ticket: Ticket,
  warehouse: Warehouse,
  plane: Plane,
  "map-pin": MapPin,
  mail: Mail,
  calendar: CalendarDays,
  "calendar-days": CalendarDays,
  "calendar-check": CalendarCheck,
  award: Award,
  settings: Settings,
  blocks: Blocks,
  users: Users,
  sliders: SlidersHorizontal,
  megaphone: Megaphone,
  image: Image,
  shield: Shield,
  "credit-card": CreditCard,
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
  "/admin/shop/coupons": Ticket,
  "/admin/shop/inventory": Warehouse,
  "/admin/tours/packages": MapPin,
  "/admin/tours/bookings": CalendarCheck,
  "/admin/tours/enquiries": Mail,
  "/admin/academy/attendance": CalendarCheck,
  "/admin/academy/certificates": Award,
  "/admin/tasks": CalendarDays,
  "/admin/settings/modules": Blocks,
  "/admin/settings/users": Users,
  "/admin/settings/brand": SlidersHorizontal,
  "/admin/settings/preferences": SlidersHorizontal,
  "/admin/settings/advertisements": Megaphone,
  "/admin/settings/payments": CreditCard,
  "/admin/settings/roles": Shield,
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

function NavIcon({ icon: Icon, size = "md" }: { icon: LucideIcon; size?: "md" | "lg" }) {
  const slotClass = size === "lg" ? "h-5 w-5" : "h-4 w-5";
  const iconClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span className={cn("flex shrink-0 items-center justify-center", slotClass)} aria-hidden>
      <Icon className={iconClass} />
    </span>
  );
}

function NavSectionDivider({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn("border-t", collapsed ? "my-2 border-app-border/50" : "my-2 border-app-border/60")}
      aria-hidden
    />
  );
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
        "admin-nav-link group/link relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        active ? "admin-nav-link--active" : "text-app-muted hover:text-app-text",
      )}
    >
      <NavIcon icon={Icon} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

type GroupFlyout = {
  label: string;
  items: { label: string; href: string; icon: LucideIcon }[];
  top: number;
  left: number;
};

function CollapsibleNavGroup({
  item,
  collapsed,
  pathname,
  open,
  onToggle,
  showLinkFlyout,
  hideFlyout,
  openGroupFlyout,
  dataTour,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  showLinkFlyout: (el: HTMLElement, label: string) => void;
  hideFlyout: () => void;
  openGroupFlyout: (el: HTMLElement, item: NavItem) => void;
  dataTour?: string;
}) {
  const Icon = resolveIcon(item.icon, item.href);
  const children = item.children ?? [];

  return (
    <div data-tour={dataTour} className="mb-1">
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
          <NavIcon icon={Icon} size="lg" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="mb-1 flex w-full items-center gap-3 border-l-[3px] border-l-accent/65 py-1.5 pl-[calc(0.75rem-3px)] pr-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-soft transition-colors hover:text-accent"
          >
            <NavIcon icon={Icon} />
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
  const isMobile = useAdminMobile();
  const { collapsed, width, mobileOpen, toggleCollapsed, closeMobile, setWidth, getSidebarWidth } =
    useAdminSidebarStore();
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const [linkFlyout, setLinkFlyout] = useState<{ label: string; top: number; left: number } | null>(null);
  const [groupFlyout, setGroupFlyout] = useState<GroupFlyout | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => buildOpenGroups(navigation));

  const displayCollapsed = isMobile ? false : collapsed;

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
  const sidebarCollapsed = sidebarHydrated && displayCollapsed;

  useLayoutEffect(() => {
    if (isMobile) {
      syncAdminSidebarWidthVar(mobileOpen ? DEFAULT_WIDTH : 0);
      return;
    }
    syncAdminSidebarWidthVar(sidebarHydrated ? getSidebarWidth() : DEFAULT_WIDTH);
  }, [sidebarHydrated, collapsed, width, mobileOpen, isMobile, getSidebarWidth]);

  useEffect(() => {
    return useAdminSidebarStore.subscribe((state, prev) => {
      if (state.collapsed === prev.collapsed && state.width === prev.width) return;
      if (window.matchMedia("(max-width: 1023px)").matches) return;
      syncAdminSidebarWidthVar(state.getSidebarWidth());
    });
  }, []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!isMobile) closeMobile();
  }, [isMobile, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

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
      if (!displayCollapsed) return;
      const r = el.getBoundingClientRect();
      setLinkFlyout({ label, top: r.top + r.height / 2, left: r.right + 8 });
    },
    [displayCollapsed],
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
      if (displayCollapsed || isMobile) return;
      event.preventDefault();
      resizing.current = true;
      startX.current = event.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onResizeMove);
      window.addEventListener("mouseup", onResizeEnd);
    },
    [displayCollapsed, isMobile, width, onResizeMove, onResizeEnd],
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      <aside
        data-tour="sidebar"
        className={cn(
          "admin-sidebar",
          sidebarCollapsed && "admin-sidebar--collapsed",
          mobileOpen && "admin-sidebar--mobile-open",
        )}
        style={isMobile ? undefined : { width: sidebarWidth }}
      >
        <div className="shrink-0 border-b border-app-border px-4 py-4 admin-sidebar-header">
          <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-3" : "justify-between gap-2")}>
            <EvokeLogo variant="admin-icon" href="/admin" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="inline-flex shrink-0 text-app-muted hover:text-app-text lg:hidden h-9 w-9 justify-center p-0"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
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
            const itemKey = item.href ?? item.label;

            let content: ReactNode = null;

            if (item.children?.length) {
              content = (
                <CollapsibleNavGroup
                  item={item}
                  collapsed={sidebarCollapsed}
                  pathname={pathname}
                  open={openGroups[item.label] ?? true}
                  onToggle={() => toggleGroup(item.label)}
                  showLinkFlyout={showLinkFlyout}
                  hideFlyout={hideFlyout}
                  openGroupFlyout={openGroupFlyout}
                />
              );
            } else if (item.href) {
              content = sidebarCollapsed ? (
                <Link
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  onMouseEnter={(e) => showLinkFlyout(e.currentTarget, item.label)}
                  onMouseLeave={hideFlyout}
                  onFocus={(e) => showLinkFlyout(e.currentTarget, item.label)}
                  onBlur={hideFlyout}
                  className={cn(
                    "admin-nav-link relative flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-all duration-200",
                    isRouteActive(pathname, item.href)
                      ? "admin-nav-link--active"
                      : "text-app-muted hover:text-app-text",
                  )}
                >
                  <NavIcon icon={Icon} size="lg" />
                </Link>
              ) : (
                <NavLink
                  href={item.href}
                  label={item.label}
                  icon={Icon}
                  active={isRouteActive(pathname, item.href)}
                />
              );
            }

            if (!content) return null;

            return (
              <Fragment key={itemKey}>
                {index > 0 && <NavSectionDivider collapsed={sidebarCollapsed} />}
                {content}
              </Fragment>
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
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                      active ? "bg-accent/10 text-accent-soft" : "text-app-text hover:bg-app-surface-muted",
                    )}
                  >
                    <NavIcon icon={ChildIcon} />
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
