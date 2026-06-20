"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type TourBooking } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function TourBookingsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminBookings(token, statusFilter ? { status: statusFilter } : undefined)
      .then((response) => setBookings(response.data ?? []))
      .catch(() => notifyError("Could not load bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, statusFilter]);

  const updateStatus = async (booking: TourBooking, status: string) => {
    if (!token) return;
    try {
      await apiClient.updateAdminBooking(token, booking.id, { status });
      success("Booking updated.");
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Update failed.");
    }
  };

  return (
    <PermissionGate permission="tours.bookings.manage">
      <div className="app-page">
        <PageHeader title="Tour bookings" description="Manage customer travel bookings" />
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>All bookings</CardTitle>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : bookings.length === 0 ? (
              <TableEmpty inset message="No bookings yet." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Travel</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="font-mono text-xs">{booking.booking_number}</td>
                      <td>{booking.user?.name ?? "—"}</td>
                      <td>{booking.package?.title ?? "—"}</td>
                      <td>{booking.travel_date?.slice(0, 10)}</td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td>{formatOfferingPrice(booking.total_amount, { prefix: false })}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {booking.status === "pending" && (
                            <>
                              <Button type="button" size="sm" onClick={() => updateStatus(booking, "confirmed")}>
                                Confirm
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(booking, "cancelled")}>
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.payment_status === "unpaid" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (!token) return;
                                const reference = window.prompt("Payment reference (optional):") ?? undefined;
                                await apiClient.updateAdminBooking(token, booking.id, {
                                  payment_status: "paid",
                                  payment_reference: reference || undefined,
                                });
                                success("Payment recorded.");
                                load();
                              }}
                            >
                              Mark paid
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
