"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient, type AdPlacement, type Advertisement } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "admin_sidebar", label: "Admin sidebar" },
  { value: "homepage", label: "Homepage" },
  { value: "site_header", label: "Site header" },
  { value: "footer", label: "Site footer" },
];

function newAd(): Advertisement {
  return {
    id: crypto.randomUUID(),
    title: "",
    image_url: "",
    link_url: "",
    placement: "admin_sidebar",
    enabled: true,
    sort_order: 0,
  };
}

export default function AdvertisementsSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdvertisements(token).then((r) => setAds(r.data ?? [])).catch(() => setAds([]));
  }, [token]);

  const update = (id: string, patch: Partial<Advertisement>) => {
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...patch } : ad)));
  };

  const remove = (id: string) => setAds((prev) => prev.filter((ad) => ad.id !== id));

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const { data } = await apiClient.updateAdvertisements(token, ads);
      setAds(data);
      success("Advertisements saved.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save advertisements.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="Advertisements"
        description="Manage promotional banners across admin and public site"
        actions={
          <div className="flex gap-2">
            <ActionButton variant="outline" icon={Plus} onClick={() => setAds((prev) => [...prev, newAd()])}>
              Add ad
            </ActionButton>
            <ActionButton icon={Save} loading={saving} data-admin-primary-save="true" onClick={save}>
              Save all
            </ActionButton>
          </div>
        }
      />

      {ads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-app-muted">
            No advertisements yet. Add one to show promotions in the admin sidebar or on the public site.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ads.map((ad, index) => (
            <Card key={ad.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base">Ad #{index + 1}</CardTitle>
                <div className="flex items-center gap-3">
                  <Switch checked={ad.enabled} onCheckedChange={(v) => update(ad.id, { enabled: v })} aria-label="Enabled" />
                  <ActionButton variant="outline" size="sm" icon={Trash2} onClick={() => remove(ad.id)}>
                    Remove
                  </ActionButton>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={ad.title} onChange={(e) => update(ad.id, { title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Placement</Label>
                  <Select value={ad.placement} onChange={(e) => update(ad.id, { placement: e.target.value as AdPlacement })}>
                    {PLACEMENTS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Image URL</Label>
                  <Input value={ad.image_url} onChange={(e) => update(ad.id, { image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Link URL</Label>
                  <Input value={ad.link_url} onChange={(e) => update(ad.id, { link_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={ad.sort_order}
                    onChange={(e) => update(ad.id, { sort_order: Number(e.target.value) || 0 })}
                  />
                </div>
                {ad.image_url && (
                  <div className="overflow-hidden rounded-lg border border-app-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ad.image_url} alt={ad.title || "Preview"} className="aspect-video w-full object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
