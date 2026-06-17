"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { PageLoading } from "@/components/ui/page-loading";
import { PageSectionBuilder } from "@/components/cms/page-section-builder";
import { apiClient, type CmsPage, type PageSection } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function EditCmsPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [page, setPage] = useState<CmsPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPage(token, id).then((r) => {
      setPage(r.data);
      setTitle(r.data.title);
      setStatus(r.data.status);
      setSections(r.data.sections ?? []);
    });
  }, [token, id]);

  const save = async () => {
    if (!token) return;
    await apiClient.updatePage(token, id, { title, status });
    setMessage("Page saved.");
  };

  if (!page) return <PageLoading label="Loading page..." />;

  return (
    <div className="app-page">
      <PageHeader
        title="Page Builder"
        description={`Slug: ${page.slug}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {status === "published" && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/p/${page.slug}`} target="_blank">
                  Preview page
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            <AdminBackLink href="/admin/cms/pages">← Back to pages</AdminBackLink>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="form-field"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="form-field">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          {message && <p className="text-sm text-status-success md:col-span-2">{message}</p>}
          {status === "published" && (
            <p className="text-sm text-app-muted md:col-span-2">
              Public URL:{" "}
              <Link href={`/p/${page.slug}`} target="_blank" className="font-medium text-accent-soft hover:text-accent">
                /p/{page.slug}
              </Link>
            </p>
          )}
          <div className="md:col-span-2 pt-1"><Button onClick={save}>Save Page</Button></div>
        </CardContent>
      </Card>
      <PageSectionBuilder pageId={id} sections={sections} onChange={setSections} />
    </div>
  );
}
