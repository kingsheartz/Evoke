"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { GalleryUrlsField, normalizeUrlList } from "@/components/admin/gallery-urls-field";
import { StringListField, normalizeStringList } from "@/components/admin/string-list-field";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, type ItineraryDay, type TourPackage } from "@/lib/api";
import { revalidateTourPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

interface PackageForm {
  title: string;
  description: string;
  destination: string;
  type: string;
  duration_days: number;
  price: number;
  seo_title: string;
  seo_description: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function EditPackagePage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [newDay, setNewDay] = useState({ day_number: 1, title: "", description: "" });
  const { register, handleSubmit, reset } = useForm<PackageForm>();

  const load = () => {
    if (!token) return;
    apiClient.getAdminPackage(token, id).then((r) => {
      setPkg(r.data);
      setDays(r.data.itinerary_days ?? []);
      setGallery(r.data.gallery ?? []);
      setInclusions(r.data.inclusions ?? []);
      setExclusions(r.data.exclusions ?? []);
      reset({
        title: r.data.title,
        description: r.data.description ?? "",
        destination: r.data.destination,
        type: r.data.type,
        duration_days: r.data.duration_days,
        price: Number(r.data.price),
        seo_title: r.data.seo_title ?? "",
        seo_description: r.data.seo_description ?? "",
        is_active: r.data.is_active,
        is_featured: r.data.is_featured,
      });
    });
  };

  useEffect(load, [token, id, reset]);

  const onSubmit = async (data: PackageForm) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updatePackage(token, id, {
        ...data,
        gallery: normalizeUrlList(gallery),
        inclusions: normalizeStringList(inclusions),
        exclusions: normalizeStringList(exclusions),
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
      });
      await revalidateTourPublicCache(pkg.slug);
      setMessage("Package updated.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save package.");
    }
  };

  const addDay = async () => {
    if (!token || !newDay.title) return;
    await apiClient.createItineraryDay(token, id, { ...newDay, activities: [] });
    await revalidateTourPublicCache(pkg?.slug);
    setNewDay({ day_number: days.length + 1, title: "", description: "" });
    load();
  };

  const removeDay = async (dayId: number) => {
    if (!token) return;
    await apiClient.deleteItineraryDay(token, id, dayId);
    await revalidateTourPublicCache(pkg?.slug);
    load();
  };

  if (!pkg) return <PageLoading label="Loading package..." />;

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Edit Package"
        description={pkg.title}
        actions={<AdminBackLink href="/admin/tours/packages">← Back to packages</AdminBackLink>}
      />

      <Card>
        <CardHeader><CardTitle>Package details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...register("title")} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} {...register("description")} /></div>
              <div className="space-y-2"><Label>Destination</Label><Input {...register("destination")} /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select {...register("type")}>
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                  <option value="adventure">Adventure</option>
                  <option value="group">Group</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" {...register("duration_days", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" {...register("price", { valueAsNumber: true })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>SEO title</Label><Input {...register("seo_title")} placeholder="Optional page title" /></div>
              <div className="space-y-2 md:col-span-2"><Label>SEO description</Label><Textarea rows={2} {...register("seo_description")} /></div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_active")} /> Active</label>
                <label className="flex items-center gap-2 text-sm text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_featured")} /> Featured</label>
              </div>
            </div>

            <GalleryUrlsField values={gallery.length ? gallery : [""]} onChange={(next) => setGallery(next.filter(Boolean))} />
            <StringListField label="Inclusions" addLabel="Add inclusion" values={inclusions.length ? inclusions : [""]} onChange={setInclusions} placeholder="e.g. Daily breakfast" />
            <StringListField label="Exclusions" addLabel="Add exclusion" values={exclusions.length ? exclusions : [""]} onChange={setExclusions} placeholder="e.g. Flights" />

            {message && <p className={`text-sm ${message.includes("updated") ? "text-status-success" : "text-status-error"}`}>{message}</p>}
            <Button type="submit">Save package</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itinerary (public detail page)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-app-muted">
            These days appear on the public tour detail page. CMS timeline sections on marketing pages stay separate.
          </p>
          {days.map((day) => (
            <div key={day.id} className="flex items-start justify-between rounded-lg border border-app-border bg-app-surface/80 p-4 ring-1 ring-app-border">
              <div>
                <p className="font-medium text-app-text">Day {day.day_number}: {day.title}</p>
                <p className="mt-1 text-sm text-app-muted">{day.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeDay(day.id)}><Trash2 className="h-4 w-4 text-status-error" /></Button>
            </div>
          ))}
          <div className="grid gap-3 rounded-lg border border-dashed border-app-border bg-app-surface/60 p-4 ring-1 ring-app-border md:grid-cols-3">
            <div className="space-y-2"><Label>Day #</Label><Input type="number" value={newDay.day_number} onChange={(e) => setNewDay({ ...newDay, day_number: Number(e.target.value) })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={newDay.title} onChange={(e) => setNewDay({ ...newDay, title: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-3"><Label>Description</Label><Textarea value={newDay.description} onChange={(e) => setNewDay({ ...newDay, description: e.target.value })} /></div>
            <div><Button type="button" onClick={addDay}><Plus className="mr-2 h-4 w-4" />Add day</Button></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
