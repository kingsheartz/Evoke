"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plane,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/app";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  plane: Plane,
  settings: Settings,
} as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { token, navigation, logout } = useAuthStore();

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

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-app-border bg-[#101214] text-app-text">
      <div className="border-b border-app-border px-6 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-app-text">
          Evoke Admin
        </Link>
        <p className="mt-1 text-xs text-app-muted">Platform control center</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
            ? iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard
            : LayoutDashboard;

          if (item.children?.length) {
            return (
              <div key={item.label} className="mb-4">
                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-app-muted">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
                <ul className="space-y-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm text-app-muted transition-colors hover:bg-app-surface hover:text-app-text",
                          pathname === child.href && "bg-app-surface text-accent-soft",
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (!item.href) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-app-muted transition-colors hover:bg-app-surface hover:text-app-text",
                pathname === item.href && "bg-app-surface text-accent-soft",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-app-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-app-muted hover:bg-app-surface hover:text-app-text"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
        <Link
          href="/"
          className="mt-2 block px-3 text-xs text-app-muted hover:text-accent-soft"
        >
          ← View public site
        </Link>
      </div>
    </aside>
  );
}
