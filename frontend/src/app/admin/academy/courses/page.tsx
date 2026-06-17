"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
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
      fallback={<p className="text-red-600">You do not have permission to manage courses.</p>}
    >
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
        <CardContent>
          {loading ? (
            <TableLoading message="Loading courses..." />
          ) : courses.length === 0 ? (
            <TableEmpty message="No courses yet. Create your first course." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Fees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="font-medium">{course.title}</td>
                    <td>{course.category?.name ?? "—"}</td>
                    <td>₹{course.fees}</td>
                    <td><StatusBadge status={course.status} /></td>
                    <td>
                      <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                        <Link href={`/admin/academy/courses/${course.id}`}>Edit</Link>
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
