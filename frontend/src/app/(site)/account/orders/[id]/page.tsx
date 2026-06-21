"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { AccountShell } from "@/components/account/account-shell";
import { OrderDetailView } from "@/components/shop/order-detail-view";
import { apiClient, type ShopOrder } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

function OrderDetailContent() {
  const params = useParams();
  const orderId = Number(params.id);
  const token = useAuthStore((s) => s.token);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token || !Number.isFinite(orderId)) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getOrder(token, orderId);
      setOrder(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order not found.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, orderId]);

  return (
    <AccountShell title="Order details" description="Track status, items, and payment for this order.">
      {loading ? (
        <p className="text-sm text-app-muted">Loading order…</p>
      ) : error ? (
        <p className="text-sm text-status-error">{error}</p>
      ) : order ? (
        <OrderDetailView order={order} onRefresh={load} />
      ) : null}
    </AccountShell>
  );
}

export default function AccountOrderDetailPage() {
  return (
    <CustomerAuthGuard>
      <OrderDetailContent />
    </CustomerAuthGuard>
  );
}
