"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import {
  applyCmsPagePreset,
  CMS_PAGE_PRESETS,
  getCmsPagePreset,
  type CmsPagePresetId,
} from "@/lib/cms-page-presets";
import { revalidateCmsPagePublicCache } from "@/lib/revalidate-cms";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function NewCmsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState({ title: "", type: "page", status: "draft" });
  const [presetId, setPresetId] = useState<CmsPagePresetId>("blank");
  const [creating, setCreating] = useState(false);

  const selectedPreset = getCmsPagePreset(presetId);

  const create = async () => {
    if (!token || !form.title || creating) return;
    setCreating(true);
    try {
      const pageType = presetId === "blank" ? form.type : selectedPreset.pageType;
      const { data } = await apiClient.createPage(token, { ...form, type: pageType });
      if (presetId !== "blank") {
        await applyCmsPagePreset(token, data.id, presetId);
      }
      if (form.status === "published") {
        await revalidateCmsPagePublicCache(data.slug);
      }
      router.push(`/admin/cms/pages/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="New Page"
        description="Create a CMS page from scratch or start from a quickstart template"
        actions={<AdminBackLink href="/admin/cms/pages">← Back to pages</AdminBackLink>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Quickstart template</Label>
            <Select value={presetId} onChange={(e) => setPresetId(e.target.value as CmsPagePresetId)}>
              {CMS_PAGE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
            <p className="text-sm text-app-muted">{selectedPreset.description}</p>
            {selectedPreset.sections.length > 0 && (
              <p className="text-xs text-app-muted">
                Includes {selectedPreset.sections.length} sections:{" "}
                {selectedPreset.sections.map((section) => section.type).join(", ")}
              </p>
            )}
          </div>
          {presetId === "blank" && (
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="page">Page</option>
                <option value="blog">Blog</option>
                <option value="landing">Landing</option>
                <option value="promotion">Promotion</option>
                <option value="event">Event</option>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button onClick={create} disabled={creating || !form.title}>
              {creating ? "Creating…" : presetId === "blank" ? "Create & Build Page" : "Create from template"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
