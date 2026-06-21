"use client";

import { useEffect, useState } from "react";
import { apiClient, type AcademyCertificate } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";

export function CertificateList({
  token,
  compact,
}: {
  token: string;
  compact?: boolean;
}) {
  const [certificates, setCertificates] = useState<AcademyCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getMyCertificates(token)
      .then((response) => setCertificates(response.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const rows = compact ? certificates.slice(0, 5) : certificates;

  if (loading) {
    return compact ? (
      <p className="text-sm text-app-muted">Loading certificates…</p>
    ) : (
      <TableLoading inset />
    );
  }

  return (
    <Card variant="glass">
      {!compact && (
        <CardHeader>
          <CardTitle className="text-lg">Certificates</CardTitle>
        </CardHeader>
      )}
      <CardContent flush={!compact} className={compact ? "p-0" : undefined}>
        {rows.length === 0 ? (
          <TableEmpty inset={!compact} message="No certificates issued yet." />
        ) : (
          <DataTable inset>
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Course</th>
                <th>Issued</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((certificate) => (
                <tr key={certificate.id}>
                  <td className="font-mono text-xs">{certificate.certificate_number}</td>
                  <td>{certificate.enrollment?.batch?.course?.title ?? "—"}</td>
                  <td>{certificate.issued_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </CardContent>
    </Card>
  );
}
