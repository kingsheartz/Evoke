"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableIconAction, TableRowActions } from "@/components/ui/table-row-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type Trainer } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function AcademyTrainersPage() {
  const token = useAuthStore((s) => s.token);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getAdminTrainers(token)
      .then((response) => setTrainers(response.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <PermissionGate
      permission="academy.trainers.manage"
      fallback={<p className="text-status-error">You do not have permission to manage trainers.</p>}
    >
      <div className="app-page">
        <PageHeader
          title="Trainers"
          description="Manage academy instructors assigned to batches"
          actions={
            <ActionButton asChild icon={Plus}>
              <Link href="/admin/academy/trainers/new">Add trainer</Link>
            </ActionButton>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>All trainers</CardTitle>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : trainers.length === 0 ? (
              <TableEmpty inset message="No trainers yet." />
            ) : (
              <ConfigurableDataTable
                tableId="admin-academy-trainers"
                inset
                data={trainers}
                keyField="id"
                searchPlaceholder="Search trainers…"
                searchText={(trainer) =>
                  [trainer.name, ...(trainer.specializations ?? []), trainer.is_active ? "active" : "inactive"]
                    .filter(Boolean)
                    .join(" ")
                }
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    width: 200,
                    render: (trainer) => <span className="font-medium">{trainer.name}</span>,
                  },
                  {
                    key: "specializations",
                    header: "Specializations",
                    width: 240,
                    render: (trainer) => (trainer.specializations ?? []).slice(0, 2).join(", ") || "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    width: 120,
                    render: (trainer) => <StatusBadge status={trainer.is_active} />,
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    width: 88,
                    hideable: false,
                    pinnable: false,
                    render: (trainer) => (
                      <TableRowActions>
                        <TableIconAction asChild icon={Pencil} label="Edit trainer">
                          <Link href={`/admin/academy/trainers/${trainer.id}`} />
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
    </PermissionGate>
  );
}
