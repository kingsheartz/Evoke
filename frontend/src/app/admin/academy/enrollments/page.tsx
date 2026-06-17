"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Enrollments</h1>
        <p className="mt-1 text-zinc-500">Student course enrollments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-zinc-500">No enrollments yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-500">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-50">
                    <td className="py-3 pr-4">{e.user?.name ?? "—"}</td>
                    <td className="py-3 pr-4">{e.batch?.course?.title ?? "—"}</td>
                    <td className="py-3 pr-4 capitalize">{e.status}</td>
                    <td className="py-3 capitalize">{e.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
