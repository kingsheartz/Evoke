"use client";

import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type TourEnquiry } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function TourEnquiriesAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const [enquiries, setEnquiries] = useState<TourEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiClient
      .getAdminEnquiries(token, statusFilter ? { status: statusFilter } : undefined)
      .then((response) => setEnquiries(response.data ?? []))
      .catch(() => notifyError("Could not load enquiries."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, statusFilter]);

  const updateStatus = async (enquiry: TourEnquiry, status: string) => {
    if (!token) return;
    try {
      await apiClient.updateAdminEnquiry(token, enquiry.id, { status });
      success("Enquiry updated.");
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Update failed.");
    }
  };

  return (
    <PermissionGate permission="tours.enquiries.manage">
      <div className="app-page">
        <PageHeader title="Tour enquiries" description="Follow up on customer travel enquiries" />
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>All enquiries</CardTitle>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </Select>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : enquiries.length === 0 ? (
              <TableEmpty inset message="No enquiries yet." />
            ) : (
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Package</th>
                    <th>Travelers</th>
                    <th>Preferred date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td className="font-medium">{enquiry.name}</td>
                      <td>
                        <div className="text-sm">{enquiry.email}</div>
                        {enquiry.phone && <div className="text-xs text-app-muted">{enquiry.phone}</div>}
                      </td>
                      <td>{enquiry.package?.title ?? "—"}</td>
                      <td>{enquiry.travelers_count ?? "—"}</td>
                      <td>{enquiry.preferred_date?.slice(0, 10) ?? "—"}</td>
                      <td><StatusBadge status={enquiry.status} /></td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {enquiry.status !== "contacted" && (
                            <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(enquiry, "contacted")}>
                              Contacted
                            </Button>
                          )}
                          {enquiry.status !== "quoted" && (
                            <Button type="button" size="sm" variant="outline" onClick={() => updateStatus(enquiry, "quoted")}>
                              Quoted
                            </Button>
                          )}
                          {enquiry.status !== "closed" && (
                            <Button type="button" size="sm" onClick={() => updateStatus(enquiry, "closed")}>
                              Closed
                            </Button>
                          )}
                        </div>
                      </td>
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
