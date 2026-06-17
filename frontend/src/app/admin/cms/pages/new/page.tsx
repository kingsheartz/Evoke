"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function NewCmsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState({ title: "", type: "page", status: "draft" });

  const create = async () => {
    if (!token || !form.title) return;
    const { data } = await apiClient.createPage(token, form);
    router.push(`/admin/cms/pages/${data.id}`);
  };

  return (
    <div>
      <Link href="/admin/cms/pages" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold">New Page</h1>
      <Card>
        <CardHeader><CardTitle>Page Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
              <option value="page">Page</option><option value="blog">Blog</option><option value="landing">Landing</option><option value="promotion">Promotion</option><option value="event">Event</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </div>
          <div className="md:col-span-2"><Button onClick={create}>Create & Build Page</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
