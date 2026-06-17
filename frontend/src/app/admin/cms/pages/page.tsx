"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">CMS Pages</h1><p className="mt-1 text-zinc-500">Build landing pages, blogs, and promotions</p></div>
        <Button asChild><Link href="/admin/cms/pages/new"><Plus className="mr-2 h-4 w-4" />New Page</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Pages</CardTitle></CardHeader>
        <CardContent>
          {pages.length === 0 ? <p className="text-sm text-zinc-500">No pages yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-zinc-500"><th className="pb-3 pr-4">Title</th><th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Actions</th></tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-50">
                    <td className="py-3 pr-4 font-medium">{p.title}</td>
                    <td className="py-3 pr-4 capitalize">{p.type}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize">{p.status}</span></td>
                    <td className="py-3"><Link href={`/admin/cms/pages/${p.id}`} className="text-indigo-600 hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
