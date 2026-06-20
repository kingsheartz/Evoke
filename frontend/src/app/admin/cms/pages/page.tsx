"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { TableActionButton, TableDeleteButton, TableRowActions } from "@/components/ui/table-row-actions";
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
            <ConfigurableDataTable
              tableId="admin-cms-pages"
              inset
              data={pages}
              keyField="id"
              searchPlaceholder="Search pages…"
              searchText={(page) => [page.title, page.slug, page.type, page.status].filter(Boolean).join(" ")}
              columns={[
                {
                  key: "title",
                  header: "Title",
                  width: 220,
                  render: (page) => <span className="font-medium text-app-text">{page.title}</span>,
                },
                {
                  key: "slug",
                  header: "Slug",
                  width: 160,
                  render: (page) => (
                    <span className="max-w-[10rem] truncate font-mono text-xs text-app-muted" title={page.slug}>
                      {page.slug}
                    </span>
                  ),
                },
                {
                  key: "type",
                  header: "Type",
                  width: 100,
                  render: (page) => <span className="capitalize text-app-muted">{page.type}</span>,
                },
                {
                  key: "status",
                  header: "Status",
                  width: 120,
                  render: (page) => <StatusBadge status={page.status} />,
                },
                {
                  key: "public",
                  header: "Public",
                  width: 100,
                  render: (page) =>
                    page.status === "published" ? (
                      <Link
                        href={`/p/${page.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-soft hover:text-accent"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-app-muted">Draft</span>
                    ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  width: 180,
                  hideable: false,
                  pinnable: false,
                  render: (page) => (
                    <TableRowActions>
                      <TableActionButton asChild icon={Pencil}>
                        <Link href={`/admin/cms/pages/${page.id}`}>Edit</Link>
                      </TableActionButton>
                      <TableDeleteButton
                        disabled={deletingId === page.id}
                        onClick={() => void deletePage(page)}
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
  );
}
