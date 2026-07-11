"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Cake,
  IndianRupee,
  Package,
  PartyPopper,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, getDefaultAdminPath, hasPermission, type DashboardData } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

const statCards: {
  key: keyof DashboardData["stats"];
  label: string;
  icon: typeof Users;
  format?: (v: number) => string;
  span?: string;
  accent?: string;
}[] = [
  { key: "revenue", label: "Total Revenue", icon: IndianRupee, format: (v) => `₹${v.toLocaleString("en-IN")}`, span: "lg:col-span-2", accent: "from-accent/20 to-violet-500/10" },
  { key: "users", label: "Users", icon: Users, accent: "from-blue-500/15 to-transparent" },
  { key: "orders", label: "Orders", icon: ShoppingCart, accent: "from-emerald-500/15 to-transparent" },
  { key: "enrollments", label: "Enrollments", icon: BookOpen, accent: "from-violet-500/15 to-transparent" },
  { key: "bookings", label: "Bookings", icon: Package, accent: "from-orange-500/15 to-transparent" },
  { key: "enquiries", label: "New Enquiries", icon: TrendingUp, accent: "from-rose-500/15 to-transparent" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const permissions = useAuthStore((s) => s.permissions);
  const navigation = useAuthStore((s) => s.navigation);
  const { error: notifyError, info: notifyInfo } = useNotifications();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrationsNotified, setCelebrationsNotified] = useState(false);

  useEffect(() => {
    if (!hasPermission(permissions, ["analytics.view", "platform.manage"])) {
      router.replace(getDefaultAdminPath(navigation));
    }
  }, [permissions, navigation, router]);

  useEffect(() => {
    if (!token) return;
    if (!hasPermission(permissions, "analytics.view")) return;
    apiClient
      .getDashboard(token)
      .then((res) => setDashboard(res.data))
      .catch(() => notifyError("Unable to load dashboard stats."))
      .finally(() => setLoading(false));
  }, [token, permissions, notifyError]);

  useEffect(() => {
    if (!dashboard?.celebrations || celebrationsNotified) return;
    const { birthdays, anniversaries } = dashboard.celebrations;
    const total = birthdays.length + anniversaries.length;
    if (total === 0) return;

    const parts: string[] = [];
    if (birthdays.length > 0) {
      parts.push(`${birthdays.length} birthday${birthdays.length === 1 ? "" : "s"}`);
    }
    if (anniversaries.length > 0) {
      parts.push(`${anniversaries.length} anniversary${anniversaries.length === 1 ? "" : "ies"}`);
    }
    notifyInfo(`Today: ${parts.join(" and ")}`);
    setCelebrationsNotified(true);
  }, [dashboard, celebrationsNotified, notifyInfo]);

  return (
    <div className="app-page">
      <PageHeader
        title="Dashboard"
        badge="Overview"
        description="Platform metrics and recent activity"
      />

      <div className="dashboard-bento">        {statCards.map(({ key, label, icon: Icon, format, span, accent }) => (
          <Card
            key={key}
            variant="glass"
            className={cn("relative overflow-hidden", span)}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", accent)} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-app-muted">{label}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
                <Icon className="h-4 w-4 text-accent-soft" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-display text-3xl font-bold tracking-tight text-app-text">
                  {dashboard ? (format ? format(dashboard.stats[key]) : dashboard.stats[key]) : "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard?.celebrations &&
        (dashboard.celebrations.birthdays.length > 0 || dashboard.celebrations.anniversaries.length > 0) && (
          <Card variant="glass" className="mb-6 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PartyPopper className="h-5 w-5 text-accent-soft" />
                Today&apos;s celebrations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {dashboard.celebrations.birthdays.length > 0 && (
                <div className="rounded-xl border border-app-border bg-white/[0.02] p-4 ring-1 ring-app-border">
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium text-app-text">
                    <Cake className="h-4 w-4 text-rose-300" />
                    Birthdays
                  </p>
                  <ul className="space-y-2">
                    {dashboard.celebrations.birthdays.map((person) => (
                      <li key={`birthday-${person.id}`} className="text-sm text-app-muted">
                        <span className="font-medium text-app-text">{person.name}</span>
                        {person.age != null ? ` · turning ${person.age}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dashboard.celebrations.anniversaries.length > 0 && (
                <div className="rounded-xl border border-app-border bg-white/[0.02] p-4 ring-1 ring-app-border">
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium text-app-text">
                    <Users className="h-4 w-4 text-accent-soft" />
                    Member anniversaries
                  </p>
                  <ul className="space-y-2">
                    {dashboard.celebrations.anniversaries.map((person) => (
                      <li key={`anniversary-${person.id}`} className="text-sm text-app-muted">
                        <span className="font-medium text-app-text">{person.name}</span>
                        {person.years != null ? ` · ${person.years} year${person.years === 1 ? "" : "s"} with Evoke` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {dashboard && (
        <div className="dashboard-split">          <Card variant="glass" className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link
                href="/admin/shop/orders"
                className="inline-flex items-center gap-1 text-xs text-accent-soft transition-colors hover:text-accent"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="dashboard-card-body">
              {dashboard.recent.orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-app-muted">No orders yet.</p>
              ) : (
                <ul className="divide-y divide-app-border">
                  {dashboard.recent.orders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-4 py-3.5 text-sm transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="font-mono text-xs font-medium text-app-text">
                        {order.order_number}
                      </span>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-medium text-app-text">₹{order.total}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" className="dashboard-card">
            <CardHeader>
              <CardTitle>Module Status</CardTitle>
            </CardHeader>
            <CardContent className="dashboard-card-body overflow-y-auto">
              <ul className="space-y-2">
                {dashboard.modules.map((mod) => (
                  <li
                    key={mod.slug}
                    className="flex min-w-0 items-center justify-between gap-4 rounded-lg bg-white/[0.02] px-3 py-2.5 text-sm ring-1 ring-app-border"
                  >
                    <span className="min-w-0 truncate font-medium">{mod.name}</span>                    <StatusBadge status={mod.is_enabled ? "enabled" : "disabled"} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
