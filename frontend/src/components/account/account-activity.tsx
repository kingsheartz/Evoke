"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, type Enrollment, type ShopOrder, type TourBooking } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

function orderTotal(order: ShopOrder): string {
  return order.total ?? order.total_amount ?? "0";
}

function unwrapEnrollments(response: Awaited<ReturnType<typeof apiClient.getEnrollments>>): Enrollment[] {
  if ("data" in response && Array.isArray(response.data)) return response.data;
  if ("data" in response && response.data && !Array.isArray(response.data)) return [];
  return (response as PaginatedLike<Enrollment>).data ?? [];
}

type PaginatedLike<T> = { data: T[] };

export function AccountActivity({ token }: { token: string }) {
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.getBookings(token).then((response) => setBookings(response.data ?? [])),
      apiClient.getOrders(token).then((response) => setOrders(response.data ?? [])),
      apiClient.getEnrollments(token).then((response) => setEnrollments(unwrapEnrollments(response))),
    ]).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="text-sm text-app-muted">Loading your activity…</p>;
  }

  return (
    <div className="space-y-8">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Tour bookings</CardTitle>
        </CardHeader>
        <CardContent flush>
          {bookings.length === 0 ? (
            <TableEmpty inset message="No bookings yet." action={<Link href="/tours/packages" className="text-accent-soft hover:text-accent">Browse tours</Link>} />
          ) : (
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
                {bookings.map((booking) => (
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
                    <td><StatusBadge status={booking.status} /></td>
                    <td>{formatOfferingPrice(booking.total_amount, { prefix: false })}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Shop orders</CardTitle>
        </CardHeader>
        <CardContent flush>
          {orders.length === 0 ? (
            <TableEmpty inset message="No orders yet." action={<Link href="/shop/products" className="text-accent-soft hover:text-accent">Browse products</Link>} />
          ) : (
            <DataTable inset>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.order_number}</td>
                    <td>{order.created_at?.slice(0, 10)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{order.payment_status ?? "—"}</td>
                    <td>{formatOfferingPrice(orderTotal(order), { prefix: false })}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Course enrollments</CardTitle>
        </CardHeader>
        <CardContent flush>
          {enrollments.length === 0 ? (
            <TableEmpty inset message="No enrollments yet." action={<Link href="/academy/courses" className="text-accent-soft hover:text-accent">Browse courses</Link>} />
          ) : (
            <DataTable inset>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      {enrollment.batch?.course?.slug ? (
                        <Link href={`/academy/courses/${enrollment.batch.course.slug}`} className="hover:text-accent-soft">
                          {enrollment.batch.course.title}
                        </Link>
                      ) : (
                        enrollment.batch?.course?.title ?? "—"
                      )}
                    </td>
                    <td>{enrollment.batch?.name ?? "—"}</td>
                    <td><StatusBadge status={enrollment.status} /></td>
                    <td>{enrollment.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
