"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCheck, UserX } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions, tableIconPrimaryClassName } from "@/components/ui/table-row-actions";
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

  const rows = useMemo(
    () =>
      enrollments.map((enrollment) => ({
        id: enrollment.id,
        enrollment,
        record: recordByEnrollment.get(enrollment.id),
        busy: markingId === enrollment.id,
      })),
    [enrollments, recordByEnrollment, markingId],
  );

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
              <ConfigurableDataTable
                tableId="admin-academy-attendance"
                inset
                data={rows}
                keyField="id"
                searchPlaceholder="Search students…"
                searchText={(row) =>
                  [
                    row.enrollment.user?.name,
                    row.enrollment.batch?.course?.title,
                    row.enrollment.batch?.name,
                    row.record?.status,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "student",
                    header: "Student",
                    width: 180,
                    render: (row) => (
                      <span className="font-medium">{row.enrollment.user?.name ?? "—"}</span>
                    ),
                  },
                  {
                    key: "course",
                    header: "Course",
                    width: 200,
                    render: (row) => row.enrollment.batch?.course?.title ?? "—",
                  },
                  {
                    key: "batch",
                    header: "Batch",
                    width: 140,
                    render: (row) => row.enrollment.batch?.name ?? "—",
                  },
                  {
                    key: "today",
                    header: "Today",
                    width: 120,
                    render: (row) =>
                      row.record ? (
                        <StatusBadge status={row.record.status} />
                      ) : (
                        <span className="text-app-muted">Not marked</span>
                      ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 120,
                    hideable: false,
                    pinnable: false,
                    render: (row) => (
                      <TableRowActions>
                        <TableIconAction
                          icon={UserCheck}
                          label="Mark present"
                          className={tableIconPrimaryClassName}
                          disabled={row.busy}
                          onClick={() => mark(row.enrollment, "present")}
                        />
                        <TableIconAction
                          icon={UserX}
                          label="Mark absent"
                          disabled={row.busy}
                          onClick={() => mark(row.enrollment, "absent")}
                        />
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
