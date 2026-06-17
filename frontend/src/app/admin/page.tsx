"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  IndianRupee,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";import { apiClient, type DashboardData } from "@/lib/api";
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
  const token = useAuthStore((s) => s.token);
  const { error: notifyError } = useNotifications();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getDashboard(token)
      .then((res) => setDashboard(res.data))
      .catch(() => notifyError("Unable to load dashboard stats."))
      .finally(() => setLoading(false));
  }, [token, notifyError]);

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
