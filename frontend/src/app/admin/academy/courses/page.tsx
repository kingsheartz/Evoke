"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionGate } from "@/components/admin/permission-gate";
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Academy Courses</h1>
          <p className="mt-1 text-zinc-500">Create and manage training programs</p>
        </div>
        <Button asChild>
          <Link href="/admin/academy/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-zinc-500">No courses yet. Create your first course.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Fees</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-zinc-50">
                      <td className="py-3 pr-4 font-medium">{course.title}</td>
                      <td className="py-3 pr-4">{course.category?.name ?? "—"}</td>
                      <td className="py-3 pr-4">₹{course.fees}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize">
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/academy/courses/${course.id}`}
                          className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
