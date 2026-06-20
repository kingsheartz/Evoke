"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient, type AcademyCertificate } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function AcademyCertificatesAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [certificates, setCertificates] = useState<AcademyCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminCertificates(token)
      .then((response) => setCertificates(response.data ?? []))
      .catch(() => notifyError("Could not load certificates."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !enrollmentId) return;
    setIssuing(true);
    try {
      await apiClient.issueCertificate(token, { enrollment_id: Number(enrollmentId) });
      success("Certificate issued.");
      setEnrollmentId("");
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not issue certificate.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <PermissionGate permission="academy.certificates.manage">
      <div className="app-page">
        <PageHeader title="Certificates" description="Issue and view academy completion certificates" />
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Issue certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={issue} className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment-id">Enrollment ID</Label>
                <Input
                  id="enrollment-id"
                  type="number"
                  min="1"
                  value={enrollmentId}
                  onChange={(e) => setEnrollmentId(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-40"
                  required
                />
              </div>
              <Button type="submit" disabled={issuing}>
                {issuing ? "Issuing…" : "Issue certificate"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Issued certificates</CardTitle>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : certificates.length === 0 ? (
              <TableEmpty inset message="No certificates issued yet." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((certificate) => (
                    <tr key={certificate.id}>
                      <td className="font-mono text-xs">{certificate.certificate_number}</td>
                      <td>{certificate.enrollment?.user?.name ?? "—"}</td>
                      <td>{certificate.enrollment?.batch?.course?.title ?? "—"}</td>
                      <td>{certificate.issued_at?.slice(0, 10) ?? "—"}</td>
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
