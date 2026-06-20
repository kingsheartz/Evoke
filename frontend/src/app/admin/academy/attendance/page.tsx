"use client";

import { useEffect, useMemo, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type AttendanceRecord, type Enrollment } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AcademyAttendanceAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [date, setDate] = useState(todayIso);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const recordByEnrollment = useMemo(() => {
    const map = new Map<number, AttendanceRecord>();
    for (const record of records) {
      map.set(record.enrollment_id, record);
    }
    return map;
  }, [records]);

  const load = () => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      apiClient.getAttendanceEnrollments(token),
      apiClient.getAdminAttendance(token, { date }),
    ])
      .then(([enrollmentRes, attendanceRes]) => {
        setEnrollments(enrollmentRes.data ?? []);
        setRecords(attendanceRes.data ?? []);
      })
      .catch(() => notifyError("Could not load attendance data."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, date]);

  const mark = async (enrollment: Enrollment, status: "present" | "absent") => {
    if (!token) return;
    setMarkingId(enrollment.id);
    try {
      await apiClient.markAttendance(token, {
        enrollment_id: enrollment.id,
        date,
        status,
        method: "manual",
      });
      success(`Marked ${status}.`);
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Could not mark attendance.");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <PermissionGate permission="academy.attendance.manage">
      <div className="app-page">
        <PageHeader title="Attendance" description="Mark daily attendance for enrolled students" />
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>Mark attendance</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="attendance-date" className="sr-only">
                Date
              </Label>
              <Input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
              />
            </div>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : enrollments.length === 0 ? (
              <TableEmpty inset message="No approved enrollments to mark." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Today</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const record = recordByEnrollment.get(enrollment.id);
                    const busy = markingId === enrollment.id;
                    return (
                      <tr key={enrollment.id}>
                        <td className="font-medium">{enrollment.user?.name ?? "—"}</td>
                        <td>{enrollment.batch?.course?.title ?? "—"}</td>
                        <td>{enrollment.batch?.name ?? "—"}</td>
                        <td>
                          {record ? (
                            <StatusBadge status={record.status} />
                          ) : (
                            <span className="text-app-muted">Not marked</span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() => mark(enrollment, "present")}
                            >
                              Present
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => mark(enrollment, "absent")}
                            >
                              Absent
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
