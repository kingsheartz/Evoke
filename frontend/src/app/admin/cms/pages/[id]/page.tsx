"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  if (!page) return <p className="text-sm text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/cms/pages" className="text-sm text-zinc-500">← Back to pages</Link>
        <h1 className="mt-2 text-3xl font-bold">Page Builder</h1>
        <p className="text-sm text-zinc-500">{page.slug}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </div>
          {message && <p className="text-sm text-emerald-600 md:col-span-2">{message}</p>}
          <div className="md:col-span-2"><Button onClick={save}>Save Page</Button></div>
        </CardContent>
      </Card>
      <PageSectionBuilder pageId={id} sections={sections} onChange={setSections} />
    </div>
  );
}
