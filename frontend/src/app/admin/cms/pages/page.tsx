"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient, type CmsPage } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function CmsPagesListPage() {
  const token = useAuthStore((s) => s.token);
  const [pages, setPages] = useState<CmsPage[]>([]);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPages(token).then((r) => setPages(r.data));
  }, [token]);

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        description="Build landing pages, blogs, and promotions"
        actions={
          <ActionButton asChild icon={Plus}>
            <Link href="/admin/cms/pages/new">New Page</Link>
          </ActionButton>
        }
      />
      <Card>
        <CardHeader><CardTitle>All Pages</CardTitle></CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <TableEmpty message="No pages yet. Create your first page." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="capitalize">{p.type}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                        <Link href={`/admin/cms/pages/${p.id}`}>Edit</Link>
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
