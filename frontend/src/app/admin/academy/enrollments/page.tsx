"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
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

  const updateEnrollment = async (enrollment: Enrollment, status: string) => {
    if (!token) return;
    try {
      await apiClient.updateEnrollment(token, enrollment.id, { status });
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
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="font-medium text-app-text">{enrollment.user?.name ?? "—"}</td>
                      <td>{enrollment.batch?.course?.title ?? "—"}</td>
                      <td>{enrollment.batch?.name ?? "—"}</td>
                      <td><StatusBadge status={enrollment.status} /></td>
                      <td><StatusBadge status={enrollment.payment_status} /></td>
                      <td>
                        {enrollment.status === "pending" && (
                          <div className="flex flex-wrap gap-1">
                            <Button type="button" size="sm" onClick={() => updateEnrollment(enrollment, "approved")}>
                              Approve
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => updateEnrollment(enrollment, "rejected")}>
                              Reject
                            </Button>
                          </div>
                        )}
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
