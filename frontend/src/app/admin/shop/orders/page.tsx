"use client";

import { useEffect, useState } from "react";
import { Banknote, PackageCheck, Truck } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions, tableIconPrimaryClassName } from "@/components/ui/table-row-actions";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type ShopOrder } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { useNotifications } from "@/lib/notifications";
import { PAYMENT_REFERENCE_PROMPT, usePrompt } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

function orderTotal(order: ShopOrder): string {
  return order.total ?? order.total_amount ?? "0";
}

export default function ShopOrdersAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const prompt = usePrompt();
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

  const markPaid = async (order: ShopOrder) => {
    if (!token) return;
    const reference = await prompt(PAYMENT_REFERENCE_PROMPT);
    if (reference === null) return;
    try {
      await apiClient.updateAdminOrder(token, order.id, {
        payment_status: "paid",
        payment_reference: reference.trim() || undefined,
      });
      success("Payment recorded.");
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
              <ConfigurableDataTable
                tableId="admin-shop-orders"
                inset
                data={orders}
                keyField="id"
                searchPlaceholder="Search orders…"
                searchText={(order) =>
                  [
                    order.order_number,
                    order.user?.name,
                    order.status,
                    order.payment_status,
                    orderTotal(order),
                    order.created_at,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "order",
                    header: "Order",
                    width: 140,
                    render: (order) => <span className="font-mono text-xs">{order.order_number}</span>,
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    width: 160,
                    render: (order) => order.user?.name ?? "—",
                  },
                  {
                    key: "date",
                    header: "Date",
                    width: 120,
                    render: (order) => order.created_at?.slice(0, 10) ?? "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    width: 120,
                    render: (order) => <StatusBadge status={order.status} />,
                  },
                  {
                    key: "payment",
                    header: "Payment",
                    width: 120,
                    render: (order) => order.payment_status ?? "—",
                  },
                  {
                    key: "total",
                    header: "Total",
                    width: 120,
                    render: (order) => formatOfferingPrice(orderTotal(order), { prefix: false }),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 140,
                    hideable: false,
                    pinnable: false,
                    render: (order) => (
                      <TableRowActions>
                        {order.status === "pending" && (
                          <TableIconAction
                            icon={PackageCheck}
                            label="Process order"
                            className={tableIconPrimaryClassName}
                            onClick={() => updateStatus(order, "processing")}
                          />
                        )}
                        {order.status === "processing" && (
                          <TableIconAction
                            icon={Truck}
                            label="Mark as shipped"
                            className={tableIconPrimaryClassName}
                            onClick={() => updateStatus(order, "shipped")}
                          />
                        )}
                        {order.payment_status === "unpaid" && (
                          <TableIconAction
                            icon={Banknote}
                            label="Mark as paid"
                            onClick={() => void markPaid(order)}
                          />
                        )}
                      </TableRowActions>
                    ),
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
