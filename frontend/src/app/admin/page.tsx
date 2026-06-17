"use client";

import { useEffect, useState } from "react";
import { BookOpen, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, type DashboardData } from "@/lib/api";
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
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getDashboard(token)
      .then((res) => setDashboard(res.data))
      .catch(() => setError("Unable to load dashboard stats."));
  }, [token]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-zinc-500">Platform overview and recent activity</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, format }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{label}</CardTitle>
              <Icon className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard
                  ? format
                    ? format(dashboard.stats[key])
                    : dashboard.stats[key]
                  : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recent.orders.length === 0 ? (
                <p className="text-sm text-zinc-500">No orders yet.</p>
              ) : (
                <ul className="space-y-3">
                  {dashboard.recent.orders.map((order) => (
                    <li key={order.id} className="flex justify-between text-sm">
                      <span>{order.order_number}</span>
                      <span className="text-zinc-500">₹{order.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Module Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dashboard.modules.map((mod) => (
                  <li key={mod.slug} className="flex items-center justify-between text-sm">
                    <span>{mod.name}</span>
                    <span
                      className={
                        mod.is_enabled
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                          : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
                      }
                    >
                      {mod.is_enabled ? "Enabled" : "Disabled"}
                    </span>
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
