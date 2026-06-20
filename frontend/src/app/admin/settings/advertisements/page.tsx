"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AD_PLACEMENT_OPTIONS, normalizeAdvertisement } from "@/lib/ad-placements";
import { invalidateSiteAdsCache } from "@/hooks/use-site-ads";
import { apiClient, type AdPlacement, type Advertisement } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

function newAd(): Advertisement {
  return {
    id: crypto.randomUUID(),
    title: "",
    image_url: "",
    link_url: "",
    placement: "floating_right",
    enabled: true,
    sort_order: 0,
    dismissible: true,
  };
}

export default function AdvertisementsSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getAdvertisements(token)
      .then((r) => setAds((r.data ?? []).map(normalizeAdvertisement)))
      .catch(() => setAds([]));
  }, [token]);

  const update = (id: string, patch: Partial<Advertisement>) => {
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...patch } : ad)));
  };

  const remove = (id: string) => setAds((prev) => prev.filter((ad) => ad.id !== id));

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const { data } = await apiClient.updateAdvertisements(token, ads.map(normalizeAdvertisement));
      setAds(data.map(normalizeAdvertisement));
      invalidateSiteAdsCache();
      success("Advertisements saved. Visitor dismissals reset on next page load.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save advertisements.");
    } finally {
      setSaving(false);
    }
  };

  const placementHint = (placement: AdPlacement) =>
    AD_PLACEMENT_OPTIONS.find((p) => p.value === placement)?.hint ?? "";

  return (
    <div className="app-page">
      <PageHeader
        title="Advertisements"
        description="Promotional banners for the public site only — choose placement, side, and whether visitors can dismiss each ad."
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
            No advertisements yet. Add one to show promotions on the public site.
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
                    {AD_PLACEMENT_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-app-muted">{placementHint(ad.placement)}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Image</Label>
                  <MediaUrlField
                    kind="image"
                    value={ad.image_url}
                    onChange={(url) => update(ad.id, { image_url: url })}
                  />
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
                <div className="flex items-center justify-between gap-3 rounded-lg border border-app-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-app-text">Allow dismiss (close button)</p>
                    <p className="text-xs text-app-muted">Visitors can hide this ad; preference is saved in their browser.</p>
                  </div>
                  <Switch
                    checked={ad.dismissible ?? true}
                    onCheckedChange={(v) => update(ad.id, { dismissible: v })}
                    aria-label="Dismissible"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
