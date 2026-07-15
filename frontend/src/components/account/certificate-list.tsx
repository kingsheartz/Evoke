"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { CertificatePreviewModal } from "@/components/academy/certificate-preview-modal";
import { AccountListFilters, matchesAccountSearch } from "@/components/account/account-list-filters";
import { AccountRecordCard, AccountRecordRow } from "@/components/account/account-record-card";
import { apiClient, type AcademyCertificate } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    apiClient
      .getMyCertificates(token)
      .then((response) => setCertificates(response.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    return certificates.filter((certificate) =>
      matchesAccountSearch(
        [certificate.certificate_number, certificate.enrollment?.batch?.course?.title],
        search,
      ),
    );
  }, [certificates, search]);

  const rows = compact ? certificates.slice(0, 5) : filtered;

  if (loading) {
    return compact ? (
      <p className="text-sm text-app-muted">Loading certificates…</p>
    ) : (
      <TableLoading inset />
    );
  }

  return (
    <>
      <Card variant="glass">
        {!compact && (
          <CardHeader>
            <CardTitle className="text-lg">Certificates</CardTitle>
          </CardHeader>
        )}
        <CardContent flush={!compact} className={compact ? "p-0" : undefined}>
          {!compact && certificates.length > 0 && (
            <AccountListFilters
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search certificate or course…"
            />
          )}
          {rows.length === 0 ? (
            <TableEmpty
              inset={!compact}
              message={
                certificates.length === 0
                  ? "No certificates issued yet."
                  : "No certificates match your search."
              }
            />
          ) : (
            <>
              <ul className="space-y-3 p-4 md:hidden">
                {rows.map((certificate) => (
                  <li key={certificate.id}>
                    <AccountRecordCard>
                      <AccountRecordRow
                        label="Certificate"
                        value={<span className="font-mono text-xs">{certificate.certificate_number}</span>}
                      />
                      <AccountRecordRow
                        label="Course"
                        value={certificate.enrollment?.batch?.course?.title ?? "—"}
                      />
                      <AccountRecordRow label="Issued" value={certificate.issued_at?.slice(0, 10) ?? "—"} />
                      {certificate.file_path ? (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() =>
                              setPreview({
                                url: certificate.file_path!,
                                title: certificate.certificate_number,
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                            <a href={certificate.file_path} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-app-muted">File pending</p>
                      )}
                    </AccountRecordCard>
                  </li>
                ))}
              </ul>
              <div className="hidden md:block table-wrap table-wrap--scrollable">
                <DataTable inset>
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>Course</th>
                  <th>Issued</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((certificate) => (
                  <tr key={certificate.id}>
                    <td className="font-mono text-xs">{certificate.certificate_number}</td>
                    <td>{certificate.enrollment?.batch?.course?.title ?? "—"}</td>
                    <td>{certificate.issued_at?.slice(0, 10)}</td>
                    <td>
                      {certificate.file_path ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() =>
                              setPreview({
                                url: certificate.file_path!,
                                title: certificate.certificate_number,
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="h-8 px-2" asChild>
                            <a href={certificate.file_path} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-app-muted">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CertificatePreviewModal
        open={Boolean(preview)}
        url={preview?.url ?? null}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
