"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type Enrollment } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function EnrollmentsPage() {
  const token = useAuthStore((s) => s.token);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getEnrollments(token).then((res) => {
      const data = "data" in res ? res.data : [];
      setEnrollments(Array.isArray(data) ? data : data);
    });
  }, [token]);

  return (
    <div className="app-page">
      <PageHeader
        title="Enrollments"
        description="Student course enrollments across the academy"
      />
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
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
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="font-medium text-app-text">{e.user?.name ?? "—"}</td>
                    <td>{e.batch?.course?.title ?? "—"}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td><StatusBadge status={e.payment_status} /></td>
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
