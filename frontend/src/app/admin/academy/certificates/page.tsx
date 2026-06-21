"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Upload } from "lucide-react";
import { CertificateFileField } from "@/components/academy/certificate-file-field";
import { CertificatePreviewModal } from "@/components/academy/certificate-preview-modal";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions } from "@/components/ui/table-row-actions";
import { apiClient, type AcademyCertificate } from "@/lib/api";
import { CERTIFICATE_FILE_ACCEPT } from "@/lib/media";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function AcademyCertificatesAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [certificates, setCertificates] = useState<AcademyCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [attachingId, setAttachingId] = useState<number | null>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const attachTargetRef = useRef<AcademyCertificate | null>(null);

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

  const issue = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !enrollmentId) return;
    setIssuing(true);
    try {
      await apiClient.issueCertificate(token, {
        enrollment_id: Number(enrollmentId),
        file_path: filePath.trim() || undefined,
      });
      success("Certificate issued.");
      setEnrollmentId("");
      setFilePath("");
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not issue certificate.");
    } finally {
      setIssuing(false);
    }
  };

  const attachFile = async (certificate: AcademyCertificate, file: File) => {
    if (!token) return;
    setAttachingId(certificate.id);
    try {
      const { data } = await apiClient.uploadCertificateFile(token, file);
      await apiClient.updateCertificateFile(token, certificate.id, data.url);
      success("Certificate file attached.");
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not attach certificate file.");
    } finally {
      setAttachingId(null);
    }
  };

  const startAttach = (certificate: AcademyCertificate) => {
    attachTargetRef.current = certificate;
    attachInputRef.current?.click();
  };

  const onAttachSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const certificate = attachTargetRef.current;
    attachTargetRef.current = null;
    if (file && certificate) void attachFile(certificate, file);
  };

  return (
    <PermissionGate permission="academy.certificates.manage">
      <div className="app-page">
        <PageHeader title="Certificates" description="Issue and view academy completion certificates" />
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Issue certificate</CardTitle>
            <CardDescription>
              Enter an approved enrollment ID and optionally upload the certificate PDF or image before issuing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={issue} className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment-id">Enrollment ID</Label>
                  <Input
                    id="enrollment-id"
                    type="number"
                    min="1"
                    value={enrollmentId}
                    onChange={(event) => setEnrollmentId(event.target.value)}
                    placeholder="e.g. 42"
                    className="w-full max-w-xs"
                    required
                  />
                </div>
                <Button type="submit" disabled={issuing}>
                  {issuing ? "Issuing…" : "Issue certificate"}
                </Button>
              </div>
              <CertificateFileField
                id="certificate-file"
                value={filePath}
                onChange={setFilePath}
              />
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
              <ConfigurableDataTable
                tableId="admin-academy-certificates"
                inset
                data={certificates}
                keyField="id"
                searchPlaceholder="Search certificates…"
                searchText={(certificate) =>
                  [
                    certificate.certificate_number,
                    certificate.enrollment?.user?.name,
                    certificate.enrollment?.batch?.course?.title,
                    certificate.issued_at,
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "number",
                    header: "Number",
                    width: 160,
                    render: (certificate) => (
                      <span className="font-mono text-xs">{certificate.certificate_number}</span>
                    ),
                  },
                  {
                    key: "student",
                    header: "Student",
                    width: 180,
                    render: (certificate) => certificate.enrollment?.user?.name ?? "—",
                  },
                  {
                    key: "course",
                    header: "Course",
                    width: 200,
                    render: (certificate) => certificate.enrollment?.batch?.course?.title ?? "—",
                  },
                  {
                    key: "issued",
                    header: "Issued",
                    width: 120,
                    render: (certificate) => certificate.issued_at?.slice(0, 10) ?? "—",
                  },
                  {
                    key: "file",
                    header: "File",
                    width: 120,
                    hideable: false,
                    pinnable: false,
                    render: (certificate) =>
                      certificate.file_path ? (
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
                      ) : (
                        <span className="text-xs text-app-muted">None</span>
                      ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 88,
                    hideable: false,
                    pinnable: false,
                    render: (certificate) => (
                      <TableRowActions>
                        <TableIconAction
                          icon={Upload}
                          label={
                            attachingId === certificate.id
                              ? "Uploading file…"
                              : certificate.file_path
                                ? "Replace certificate file"
                                : "Upload certificate file"
                          }
                          loading={attachingId === certificate.id}
                          disabled={attachingId === certificate.id}
                          onClick={() => startAttach(certificate)}
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

      <CertificatePreviewModal
        open={Boolean(preview)}
        url={preview?.url ?? null}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
      <input
        ref={attachInputRef}
        type="file"
        accept={CERTIFICATE_FILE_ACCEPT}
        className="hidden"
        onChange={onAttachSelected}
      />
    </PermissionGate>
  );
}
