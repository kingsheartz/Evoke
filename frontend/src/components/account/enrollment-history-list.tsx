"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, type Enrollment } from "@/lib/api";
import { AccountRecordCard, AccountRecordRow } from "@/components/account/account-record-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

function unwrapEnrollments(response: Awaited<ReturnType<typeof apiClient.getEnrollments>>): Enrollment[] {
  if ("data" in response && Array.isArray(response.data)) return response.data;
  return [];
}

export function EnrollmentHistoryList({
  token,
  compact,
}: {
  token: string;
  compact?: boolean;
}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getEnrollments(token)
      .then((response) => setEnrollments(unwrapEnrollments(response)))
      .finally(() => setLoading(false));
  }, [token]);

  const rows = compact ? enrollments.slice(0, 5) : enrollments;

  if (loading) {
    return compact ? (
      <p className="text-sm text-app-muted">Loading enrollments…</p>
    ) : (
      <TableLoading inset />
    );
  }

  return (
    <Card variant="glass">
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Course enrollments</CardTitle>
          <Link href="/academy/courses" className="text-sm font-medium text-accent-soft hover:text-accent">
            Browse courses
          </Link>
        </CardHeader>
      )}
      <CardContent flush={!compact} className={compact ? "p-0" : undefined}>
        {rows.length === 0 ? (
          <TableEmpty
            inset={!compact}
            message="No enrollments yet."
            action={
              <Link href="/academy/courses" className="text-accent-soft hover:text-accent">
                Browse courses
              </Link>
            }
          />
        ) : (
          <>
            <ul className="space-y-3 p-4 md:hidden">
              {rows.map((enrollment) => (
                <li key={enrollment.id}>
                  <AccountRecordCard>
                    <AccountRecordRow
                      label="Course"
                      value={
                        enrollment.batch?.course?.slug ? (
                          <Link
                            href={`/academy/courses/${enrollment.batch.course.slug}`}
                            className="hover:text-accent-soft"
                          >
                            {enrollment.batch.course.title}
                          </Link>
                        ) : (
                          enrollment.batch?.course?.title ?? "—"
                        )
                      }
                    />
                    <AccountRecordRow label="Batch" value={enrollment.batch?.name ?? "—"} />
                    <AccountRecordRow label="Status" value={<StatusBadge status={enrollment.status} />} />
                    <AccountRecordRow label="Payment" value={enrollment.payment_status} />
                  </AccountRecordCard>
                </li>
              ))}
            </ul>
            <div className="hidden md:block table-wrap table-wrap--scrollable">
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
                {rows.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      {enrollment.batch?.course?.slug ? (
                        <Link
                          href={`/academy/courses/${enrollment.batch.course.slug}`}
                          className="hover:text-accent-soft"
                        >
                          {enrollment.batch.course.title}
                        </Link>
                      ) : (
                        enrollment.batch?.course?.title ?? "—"
                      )}
                    </td>
                    <td>{enrollment.batch?.name ?? "—"}</td>
                    <td>
                      <StatusBadge status={enrollment.status} />
                    </td>
                    <td>{enrollment.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            </div>
            {compact && enrollments.length > 5 && (
              <p className="mt-3 text-sm">
                <Link href="/account/enrollments" className="font-medium text-accent-soft hover:text-accent">
                  View all {enrollments.length} enrollments →
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
