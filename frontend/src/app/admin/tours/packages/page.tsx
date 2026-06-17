"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type TourPackage } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function TourPackagesPage() {
  const token = useAuthStore((s) => s.token);
  const [packages, setPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPackages(token).then((r) => setPackages(r.data));
  }, [token]);

  return (
    <div className="app-page">
      <PageHeader
        title="Tour Packages"
        description="Manage travel packages and itineraries"
        actions={
          <ActionButton asChild icon={Plus}>
            <Link href="/admin/tours/packages/new">Add Package</Link>
          </ActionButton>
        }
      />
      <Card>
        <CardHeader><CardTitle>All Packages</CardTitle></CardHeader>
        <CardContent flush>
          {packages.length === 0 ? (
            <TableEmpty inset message="No packages yet. Add your first package." />
          ) : (
            <DataTable inset>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Destination</th>
                  <th>Days</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td>{p.destination}</td>
                    <td>{p.duration_days}</td>
                    <td>₹{p.price}</td>
                    <td><StatusBadge status={p.is_active} /></td>
                    <td>
                      <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                        <Link href={`/admin/tours/packages/${p.id}`}>Edit</Link>
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
