"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiClient, type ShopOrder } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { AccountRecordCard, AccountRecordRow } from "@/components/account/account-record-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

function orderTotal(order: ShopOrder): string {
  return order.total ?? order.total_amount ?? "0";
}

export function OrderHistoryList({
  token,
  compact,
}: {
  token: string;
  compact?: boolean;
}) {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getOrders(token)
      .then((response) => setOrders(response.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const rows = compact ? orders.slice(0, 5) : orders;

  if (loading) {
    return compact ? (
      <p className="text-sm text-app-muted">Loading orders…</p>
    ) : (
      <TableLoading inset />
    );
  }

  return (
    <Card variant="glass">
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Shop orders</CardTitle>
          <Link href="/shop/products" className="text-sm font-medium text-accent-soft hover:text-accent">
            Continue shopping
          </Link>
        </CardHeader>
      )}
      <CardContent flush={!compact} className={compact ? "p-0" : undefined}>
        {rows.length === 0 ? (
          <TableEmpty
            inset={!compact}
            message="No orders yet."
            action={
              <Link href="/shop/products" className="text-accent-soft hover:text-accent">
                Browse products
              </Link>
            }
          />
        ) : (
          <>
            <ul className="space-y-3 p-4 md:hidden">
              {rows.map((order) => (
                <li key={order.id}>
                  <Link href={`/account/orders/${order.id}`} className="block transition-opacity hover:opacity-90">
                    <AccountRecordCard>
                      <AccountRecordRow label="Order" value={<span className="font-mono text-xs">{order.order_number}</span>} />
                      <AccountRecordRow label="Date" value={order.created_at?.slice(0, 10) ?? "—"} />
                      <AccountRecordRow label="Status" value={<StatusBadge status={order.status} />} />
                      <AccountRecordRow label="Payment" value={order.payment_status ?? "—"} />
                      <AccountRecordRow
                        label="Total"
                        value={formatOfferingPrice(orderTotal(order), { prefix: false })}
                      />
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-accent-soft">
                        View details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </p>
                    </AccountRecordCard>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden md:block table-wrap table-wrap--scrollable">
              <DataTable inset>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.order_number}</td>
                    <td>{order.created_at?.slice(0, 10)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{order.payment_status ?? "—"}</td>
                    <td>{formatOfferingPrice(orderTotal(order), { prefix: false })}</td>
                    <td>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-sm font-medium text-accent-soft hover:text-accent"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            </div>
            {compact && orders.length > 5 && (
              <p className="mt-3 text-sm">
                <Link href="/account/orders" className="font-medium text-accent-soft hover:text-accent">
                  View all {orders.length} orders →
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
