"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions } from "@/components/ui/table-row-actions";
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
            <ConfigurableDataTable
              tableId="admin-tours-packages"
              inset
              data={packages}
              keyField="id"
              searchPlaceholder="Search packages…"
              searchText={(pkg) =>
                [pkg.title, pkg.destination, pkg.duration_days, pkg.price, pkg.is_active ? "active" : "inactive"]
                  .filter(Boolean)
                  .join(" ")
              }
              columns={[
                {
                  key: "title",
                  header: "Title",
                  width: 220,
                  render: (pkg) => <span className="font-medium">{pkg.title}</span>,
                },
                {
                  key: "destination",
                  header: "Destination",
                  width: 160,
                  render: (pkg) => pkg.destination,
                },
                {
                  key: "days",
                  header: "Days",
                  width: 80,
                  render: (pkg) => pkg.duration_days,
                },
                {
                  key: "price",
                  header: "Price",
                  width: 100,
                  render: (pkg) => `₹${pkg.price}`,
                },
                {
                  key: "status",
                  header: "Status",
                  width: 120,
                  render: (pkg) => <StatusBadge status={pkg.is_active} />,
                },
                {
                  key: "actions",
                  header: "Actions",
                  width: 88,
                  hideable: false,
                  pinnable: false,
                  render: (pkg) => (
                    <TableRowActions>
                      <TableIconAction asChild icon={Pencil} label="Edit package">
                        <Link href={`/admin/tours/packages/${pkg.id}`} />
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
  );
}
