"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty, TableLoading } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
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
              <DataTable inset>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Specializations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td className="font-medium">{trainer.name}</td>
                      <td>{(trainer.specializations ?? []).slice(0, 2).join(", ") || "—"}</td>
                      <td>
                        <StatusBadge status={trainer.is_active} />
                      </td>
                      <td>
                        <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                          <Link href={`/admin/academy/trainers/${trainer.id}`}>Edit</Link>
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
    </PermissionGate>
  );
}
