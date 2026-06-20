"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type Enrollment } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function EnrollmentsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const load = () => {
    if (!token) return;
    apiClient.getEnrollments(token).then((res) => {
      setEnrollments(Array.isArray(res.data) ? res.data : []);
    });
  };

  useEffect(load, [token]);

  const updateEnrollment = async (
    enrollment: Enrollment,
    payload: Partial<{ status: string; payment_status: string; payment_reference: string }>,
  ) => {
    if (!token) return;
    try {
      await apiClient.updateEnrollment(token, enrollment.id, payload);
      success("Enrollment updated.");
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Update failed.");
    }
  };

  return (
    <PermissionGate permission="academy.enrollments.manage">
      <div className="app-page">
        <PageHeader title="Enrollments" description="Student course enrollments across the academy" />
        <Card>
          <CardHeader>
            <CardTitle>All enrollments</CardTitle>
          </CardHeader>
          <CardContent flush>
            {enrollments.length === 0 ? (
              <TableEmpty inset message="No enrollments yet." />
            ) : (
              <ConfigurableDataTable
                tableId="admin-academy-enrollments"
                inset
                data={enrollments}
                keyField="id"
                searchPlaceholder="Search enrollments…"
                searchText={(enrollment) =>
                  [
                    enrollment.user?.name,
                    enrollment.batch?.course?.title,
                    enrollment.batch?.name,
                    enrollment.status,
                    enrollment.payment_status,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "student",
                    header: "Student",
                    width: 180,
                    render: (enrollment) => (
                      <span className="font-medium text-app-text">{enrollment.user?.name ?? "—"}</span>
                    ),
                  },
                  {
                    key: "course",
                    header: "Course",
                    width: 200,
                    render: (enrollment) => enrollment.batch?.course?.title ?? "—",
                  },
                  {
                    key: "batch",
                    header: "Batch",
                    width: 140,
                    render: (enrollment) => enrollment.batch?.name ?? "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    width: 120,
                    render: (enrollment) => <StatusBadge status={enrollment.status} />,
                  },
                  {
                    key: "payment",
                    header: "Payment",
                    width: 120,
                    render: (enrollment) => <StatusBadge status={enrollment.payment_status} />,
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 220,
                    hideable: false,
                    pinnable: false,
                    render: (enrollment) => (
                      <div className="table-actions flex flex-wrap gap-1">
                        {enrollment.status === "pending" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => updateEnrollment(enrollment, { status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateEnrollment(enrollment, { status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {enrollment.payment_status === "unpaid" && enrollment.status === "approved" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reference = window.prompt("Payment reference (optional):") ?? undefined;
                              updateEnrollment(enrollment, {
                                payment_status: "paid",
                                payment_reference: reference || undefined,
                              });
                            }}
                          >
                            Mark paid
                          </Button>
                        )}
                      </div>
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
