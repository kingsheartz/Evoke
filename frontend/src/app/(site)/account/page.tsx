"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Package, Plane, ShoppingBag } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { BookingHistoryList } from "@/components/account/booking-history-list";
import { OrderHistoryList } from "@/components/account/order-history-list";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

function unwrapCount(response: { data?: unknown[] }): number {
  return Array.isArray(response.data) ? response.data.length : 0;
}

export default function AccountOverviewPage() {
  const { user, token, roles, permissions } = useAuthStore();
  const isAdmin = hasAdminAccess(roles, permissions);
  const [counts, setCounts] = useState({ orders: 0, bookings: 0, enrollments: 0, cart: 0 });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiClient.getOrders(token),
      apiClient.getBookings(token),
      apiClient.getEnrollments(token),
      apiClient.getCart(token),
    ]).then(([orders, bookings, enrollments, cart]) => {
      setCounts({
        orders: unwrapCount(orders),
        bookings: unwrapCount(bookings),
        enrollments: unwrapCount(enrollments),
        cart: cart.data?.items?.length ?? 0,
      });
    });
  }, [token]);

  if (!user || !token) return null;

  const addressComplete = Boolean(user.address_line1 && user.city && user.postal_code);

  const statCards = [
    { href: "/account/orders", label: "Orders", value: counts.orders, icon: Package },
    { href: "/shop/cart", label: "Cart items", value: counts.cart, icon: ShoppingBag },
    { href: "/account/bookings", label: "Bookings", value: counts.bookings, icon: Plane },
    { href: "/account/enrollments", label: "Enrollments", value: counts.enrollments, icon: GraduationCap },
  ];

  return (
    <AccountShell
      title={`Welcome, ${user.name.split(" ")[0]}`}
      description="Your orders, bookings, and academy activity in one place."
    >
      {!addressComplete && (
        <div className="mb-6 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-app-text">
          Add your delivery address for shop checkout.{" "}
          <Link href="/account/profile" className="font-medium text-accent-soft hover:text-accent">
            Update profile →
          </Link>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-app-border bg-app-surface/80 p-5 ring-1 ring-app-border transition-colors hover:border-accent/30"
            >
              <Icon className="h-5 w-5 text-accent-soft" />
              <p className="mt-3 text-2xl font-semibold text-app-text">{card.value}</p>
              <p className="text-sm text-app-muted">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="space-y-10">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-app-text">Recent orders</h2>
            <Link href="/account/orders" className="text-sm font-medium text-accent-soft hover:text-accent">
              View all
            </Link>
          </div>
          <OrderHistoryList token={token} compact />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-app-text">Recent bookings</h2>
            <Link href="/account/bookings" className="text-sm font-medium text-accent-soft hover:text-accent">
              View all
            </Link>
          </div>
          <BookingHistoryList token={token} compact />
        </section>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/academy", label: "EVOKE Academy", description: "Courses & certificates" },
          { href: "/shop", label: "EVOKE Sports", description: "Gear & equipment" },
          { href: "/tours", label: "EVOKE Tours", description: "Travel packages" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-app-border bg-app-surface/80 p-5 transition-colors hover:border-accent/30"
          >
            <h3 className="font-medium text-app-text">{link.label}</h3>
            <p className="mt-1 text-sm text-app-muted">{link.description}</p>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-4">
          <p className="text-sm text-app-muted">
            You have staff access.{" "}
            <Link href="/admin" className="font-medium text-accent-soft hover:text-accent">
              Open admin portal →
            </Link>
          </p>
        </div>
      )}
    </AccountShell>
  );
}
