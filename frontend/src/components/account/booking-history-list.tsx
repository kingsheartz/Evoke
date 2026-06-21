"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, type TourBooking } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function BookingHistoryList({
  token,
  compact,
}: {
  token: string;
  compact?: boolean;
}) {
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getBookings(token)
      .then((response) => setBookings(response.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const rows = compact ? bookings.slice(0, 5) : bookings;

  if (loading) {
    return compact ? (
      <p className="text-sm text-app-muted">Loading bookings…</p>
    ) : (
      <TableLoading inset />
    );
  }

  return (
    <Card variant="glass">
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Tour bookings</CardTitle>
          <Link href="/tours/packages" className="text-sm font-medium text-accent-soft hover:text-accent">
            Browse tours
          </Link>
        </CardHeader>
      )}
      <CardContent flush={!compact} className={compact ? "p-0" : undefined}>
        {rows.length === 0 ? (
          <TableEmpty
            inset={!compact}
            message="No bookings yet."
            action={
              <Link href="/tours/packages" className="text-accent-soft hover:text-accent">
                Browse tours
              </Link>
            }
          />
        ) : (
          <>
            <DataTable inset>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Package</th>
                  <th>Travel date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-mono text-xs">{booking.booking_number}</td>
                    <td>
                      {booking.package?.slug ? (
                        <Link href={`/tours/${booking.package.slug}`} className="hover:text-accent-soft">
                          {booking.package.title}
                        </Link>
                      ) : (
                        booking.package?.title ?? "—"
                      )}
                    </td>
                    <td>{booking.travel_date?.slice(0, 10)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td>{formatOfferingPrice(booking.total_amount, { prefix: false })}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            {compact && bookings.length > 5 && (
              <p className="mt-3 text-sm">
                <Link href="/account/bookings" className="font-medium text-accent-soft hover:text-accent">
                  View all {bookings.length} bookings →
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
