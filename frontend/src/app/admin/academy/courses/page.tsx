"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions } from "@/components/ui/table-row-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type Course } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function AcademyCoursesPage() {
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getAdminCourses(token)
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <PermissionGate
      permission="academy.courses.manage"
      fallback={<p className="text-status-error">You do not have permission to manage courses.</p>}
    >
      <div className="app-page">
      <PageHeader
        title="Academy Courses"
        description="Create and manage training programs"
        actions={
          <ActionButton asChild icon={Plus}>
            <Link href="/admin/academy/courses/new">Add Course</Link>
          </ActionButton>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent flush>
          {loading ? (
            <TableLoading inset />
          ) : courses.length === 0 ? (
            <TableEmpty inset message="No courses yet. Create your first course." />
          ) : (
            <ConfigurableDataTable
              tableId="admin-academy-courses"
              inset
              data={courses}
              keyField="id"
              searchPlaceholder="Search courses…"
              searchText={(course) =>
                [course.title, course.category?.name, course.status, course.fees].filter(Boolean).join(" ")
              }
              columns={[
                {
                  key: "title",
                  header: "Title",
                  width: 220,
                  render: (course) => <span className="font-medium">{course.title}</span>,
                },
                {
                  key: "category",
                  header: "Category",
                  width: 160,
                  render: (course) => course.category?.name ?? "—",
                },
                {
                  key: "fees",
                  header: "Fees",
                  width: 100,
                  render: (course) => `₹${course.fees}`,
                },
                {
                  key: "status",
                  header: "Status",
                  width: 120,
                  render: (course) => <StatusBadge status={course.status} />,
                },
                {
                  key: "actions",
                  header: "Actions",
                  width: 88,
                  hideable: false,
                  pinnable: false,
                  render: (course) => (
                    <TableRowActions>
                      <TableIconAction asChild icon={Pencil} label="Edit course">
                        <Link href={`/admin/academy/courses/${course.id}`} />
                      </TableIconAction>
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
