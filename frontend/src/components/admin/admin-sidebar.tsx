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
  const { user, token, navigation, logout } = useAuthStore();

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
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-6 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Evoke Admin
        </Link>
        {user && (
          <p className="mt-1 truncate text-xs text-zinc-400">{user.email}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
            ? iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard
            : LayoutDashboard;

          if (item.children?.length) {
            return (
              <div key={item.label} className="mb-4">
                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
                <ul className="space-y-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white",
                          pathname === child.href && "bg-zinc-800 text-white",
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
                "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white",
                pathname === item.href && "bg-zinc-800 text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
        <Link
          href="/"
          className="mt-2 block px-3 text-xs text-zinc-500 hover:text-zinc-300"
        >
          ← View public site
        </Link>
      </div>
    </aside>
  );
}
