"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { revalidateCmsPagePublicCache } from "@/lib/revalidate-cms";
import { apiClient, type CmsPage } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useConfirm } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

export default function CmsPagesListPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const confirm = useConfirm();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadPages = () => {
    if (!token) return;
    apiClient.getAdminPages(token).then((r) => setPages(r.data));
  };

  useEffect(() => {
    loadPages();
  }, [token]);

  const deletePage = async (page: CmsPage) => {
    if (!token) return;
    const confirmed = await confirm({
      title: "Are you sure?",
      description: `This will permanently delete “${page.title}”. This action cannot be undone.`,
      confirmLabel: "Delete page",
      variant: "danger",
    });
    if (!confirmed) return;
    setDeletingId(page.id);
    try {
      await apiClient.deletePage(token, page.id);
      await revalidateCmsPagePublicCache(page.slug);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      success("Page deleted.");
    } catch {
      error("Could not delete page.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-page">
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
        <CardContent flush>
          {pages.length === 0 ? (
            <TableEmpty inset message="No pages yet. Create your first page." />
          ) : (
            <DataTable inset>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Public</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-app-text">{p.title}</td>
                    <td className="max-w-[10rem] truncate font-mono text-xs text-app-muted" title={p.slug}>
                      {p.slug}
                    </td>
                    <td className="capitalize text-app-muted">{p.type}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.status === "published" ? (
                        <Link
                          href={`/p/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent-soft hover:text-accent"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-app-muted">Draft</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton asChild variant="outline" size="sm" icon={Pencil}>
                          <Link href={`/admin/cms/pages/${p.id}`}>Edit</Link>
                        </ActionButton>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === p.id}
                          onClick={() => void deletePage(p)}
                        >
                          <Trash2 className="h-4 w-4 text-status-error" />
                          Delete
                        </Button>
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
  );
}
