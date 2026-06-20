"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type ShopOrder } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

function orderTotal(order: ShopOrder): string {
  return order.total ?? order.total_amount ?? "0";
}

export default function ShopOrdersAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminOrders(token, statusFilter ? { status: statusFilter } : undefined)
      .then((response) => setOrders(response.data ?? []))
      .catch(() => notifyError("Could not load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, statusFilter]);

  const updateStatus = async (order: ShopOrder, status: string) => {
    if (!token) return;
    try {
      await apiClient.updateAdminOrder(token, order.id, { status });
      success("Order updated.");
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Update failed.");
    }
  };

  return (
    <PermissionGate permission="shop.orders.manage">
      <div className="app-page">
        <PageHeader title="Shop orders" description="Manage customer product orders" />
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>All orders</CardTitle>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : orders.length === 0 ? (
              <TableEmpty inset message="No orders yet." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-xs">{order.order_number}</td>
                      <td>{order.user?.name ?? "—"}</td>
                      <td>{order.created_at?.slice(0, 10)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>{order.payment_status ?? "—"}</td>
                      <td>{formatOfferingPrice(orderTotal(order), { prefix: false })}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {order.status === "pending" && (
                            <Button type="button" size="sm" onClick={() => updateStatus(order, "processing")}>
                              Process
                            </Button>
                          )}
                          {order.status === "processing" && (
                            <Button type="button" size="sm" onClick={() => updateStatus(order, "shipped")}>
                              Ship
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
