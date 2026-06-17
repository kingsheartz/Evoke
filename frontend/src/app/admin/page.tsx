"use client";

import { useEffect, useState } from "react";
import { BookOpen, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type DashboardData } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

const statCards: {
  key: keyof DashboardData["stats"];
  label: string;
  icon: typeof Users;
  format?: (v: number) => string;
}[] = [
  { key: "users", label: "Users", icon: Users },
  { key: "enrollments", label: "Enrollments", icon: BookOpen },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "bookings", label: "Bookings", icon: Package },
  { key: "enquiries", label: "New Enquiries", icon: Package },
  { key: "revenue", label: "Revenue", icon: IndianRupee, format: (v) => `₹${v.toLocaleString("en-IN")}` },
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-app-text">Dashboard</h1>
        <p className="mt-1 text-sm text-app-muted">Platform overview and recent activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, format }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-app-muted">{label}</CardTitle>
              <Icon className="h-4 w-4 text-app-muted" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? "—" : dashboard ? (format ? format(dashboard.stats[key]) : dashboard.stats[key]) : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard && (
        <div className="dashboard-split mt-8">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="dashboard-card-body">
              {dashboard.recent.orders.length === 0 ? (
                <p className="text-sm text-app-muted">No orders yet.</p>
              ) : (
                <ul className="space-y-3">
                  {dashboard.recent.orders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">{order.order_number}</span>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="text-app-muted">₹{order.total}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Module Status</CardTitle>
            </CardHeader>
            <CardContent className="dashboard-card-body overflow-y-auto">
              <ul className="space-y-2">
                {dashboard.modules.map((mod) => (
                  <li key={mod.slug} className="flex items-center justify-between gap-4 text-sm">
                    <span>{mod.name}</span>
                    <StatusBadge status={mod.is_enabled ? "enabled" : "disabled"} />
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
