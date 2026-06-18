"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButton } from "@/components/ui/action-button";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { PageLoading } from "@/components/ui/page-loading";
import { PageSectionBuilder } from "@/components/cms/page-section-builder";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { apiClient, type CmsPage, type PageSection } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function EditCmsPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const id = Number(params.id);
  const [page, setPage] = useState<CmsPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [savedTitle, setSavedTitle] = useState("");
  const [savedStatus, setSavedStatus] = useState("draft");
  const [sectionsDirty, setSectionsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [builderKey, setBuilderKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminPage(token, id).then((r) => {
      setPage(r.data);
      setTitle(r.data.title);
      setStatus(r.data.status);
      setSavedTitle(r.data.title);
      setSavedStatus(r.data.status);
      setSections(r.data.sections ?? []);
      setSectionsDirty(false);
      setBuilderKey((k) => k + 1);
    });
  }, [token, id]);

  const pageMetaDirty = title !== savedTitle || status !== savedStatus;
  const isDirty = pageMetaDirty || sectionsDirty;

  useUnsavedChangesWarning(isDirty);

  const save = useCallback(async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiClient.updatePage(token, id, { title, status });
      await Promise.all(
        sections.map((section) =>
          apiClient.updatePageSection(token, id, section.id, { content: section.content }),
        ),
      );
      setSavedTitle(title);
      setSavedStatus(status);
      setSectionsDirty(false);
      success("Page saved.");
    } catch {
      notifyError("Could not save page.");
    } finally {
      setSaving(false);
    }
  }, [token, id, title, status, sections, success, notifyError]);

  const handleSectionsChange = useCallback((next: PageSection[]) => {
    setSections(next);
  }, []);

  if (!page) return <PageLoading label="Loading page..." />;

  return (
    <div className="app-page">
      <PageHeader
        title="Page Builder"
        description={`Slug: ${page.slug}${isDirty ? " · Unsaved changes" : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              icon={Save}
              loading={saving}
              disabled={!isDirty && !saving}
              data-admin-primary-save="true"
              onClick={save}
            >
              Save page
            </ActionButton>
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
          {status === "published" && (
            <p className="text-sm text-app-muted md:col-span-2">
              Public URL:{" "}
              <Link href={`/p/${page.slug}`} target="_blank" className="font-medium text-accent-soft hover:text-accent">
                /p/{page.slug}
              </Link>
            </p>
          )}
          <p className="text-sm text-app-muted md:col-span-2">
            Edit sections below, then save with the button above or{" "}
            <kbd className="rounded bg-app-surface-muted px-1.5 py-0.5 text-xs">Ctrl+S</kbd>.
          </p>
        </CardContent>
      </Card>
      <PageSectionBuilder
        key={builderKey}
        pageId={id}
        sections={sections}
        onChange={handleSectionsChange}
        onDirtyChange={setSectionsDirty}
      />
    </div>
  );
}
