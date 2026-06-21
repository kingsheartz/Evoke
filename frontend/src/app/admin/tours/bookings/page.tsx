"use client";

import { useEffect, useState } from "react";
import { Banknote, Check, X } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions, tableIconPrimaryClassName } from "@/components/ui/table-row-actions";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type TourBooking } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { useNotifications } from "@/lib/notifications";
import { PAYMENT_REFERENCE_PROMPT, usePrompt } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

export default function TourBookingsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const prompt = usePrompt();
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

  const markPaid = async (booking: TourBooking) => {
    if (!token) return;
    const reference = await prompt(PAYMENT_REFERENCE_PROMPT);
    if (reference === null) return;
    await apiClient.updateAdminBooking(token, booking.id, {
      payment_status: "paid",
      payment_reference: reference.trim() || undefined,
    });
    success("Payment recorded.");
    load();
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
              <ConfigurableDataTable
                tableId="admin-tours-bookings"
                inset
                data={bookings}
                keyField="id"
                searchPlaceholder="Search bookings…"
                searchText={(booking) =>
                  [
                    booking.booking_number,
                    booking.user?.name,
                    booking.package?.title,
                    booking.travel_date,
                    booking.status,
                    booking.total_amount,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "reference",
                    header: "Reference",
                    width: 140,
                    render: (booking) => (
                      <span className="font-mono text-xs">{booking.booking_number}</span>
                    ),
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    width: 160,
                    render: (booking) => booking.user?.name ?? "—",
                  },
                  {
                    key: "package",
                    header: "Package",
                    width: 180,
                    render: (booking) => booking.package?.title ?? "—",
                  },
                  {
                    key: "travel",
                    header: "Travel",
                    width: 120,
                    render: (booking) => booking.travel_date?.slice(0, 10) ?? "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    width: 120,
                    render: (booking) => <StatusBadge status={booking.status} />,
                  },
                  {
                    key: "total",
                    header: "Total",
                    width: 120,
                    render: (booking) => formatOfferingPrice(booking.total_amount, { prefix: false }),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 140,
                    hideable: false,
                    pinnable: false,
                    render: (booking) => (
                      <TableRowActions>
                        {booking.status === "pending" && (
                          <>
                            <TableIconAction
                              icon={Check}
                              label="Confirm booking"
                              className={tableIconPrimaryClassName}
                              onClick={() => updateStatus(booking, "confirmed")}
                            />
                            <TableIconAction
                              icon={X}
                              label="Cancel booking"
                              onClick={() => updateStatus(booking, "cancelled")}
                            />
                          </>
                        )}
                        {booking.payment_status === "unpaid" && (
                          <TableIconAction
                            icon={Banknote}
                            label="Mark as paid"
                            onClick={() => void markPaid(booking)}
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
