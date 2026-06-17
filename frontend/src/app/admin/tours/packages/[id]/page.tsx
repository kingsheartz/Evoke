"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { apiClient, type ItineraryDay, type TourPackage } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function EditPackagePage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [newDay, setNewDay] = useState({ day_number: 1, title: "", description: "" });
  const { register, handleSubmit, reset } = useForm<{ title: string; description: string; price: number; is_active: boolean; is_featured: boolean }>();

  const load = () => {
    if (!token) return;
    apiClient.getAdminPackage(token, id).then((r) => {
      setPkg(r.data);
      setDays(r.data.itinerary_days ?? []);
      reset({ title: r.data.title, description: r.data.description ?? "", price: Number(r.data.price), is_active: r.data.is_active, is_featured: r.data.is_featured });
    });
  };

  useEffect(load, [token, id, reset]);

  const onSubmit = async (data: { title: string; description: string; price: number; is_active: boolean; is_featured: boolean }) => {
    if (!token) return;
    await apiClient.updatePackage(token, id, data);
    setMessage("Package updated.");
  };

  const addDay = async () => {
    if (!token || !newDay.title) return;
    await apiClient.createItineraryDay(token, id, { ...newDay, activities: [] });
    setNewDay({ day_number: days.length + 1, title: "", description: "" });
    load();
  };

  const removeDay = async (dayId: number) => {
    if (!token) return;
    await apiClient.deleteItineraryDay(token, id, dayId);
    load();
  };

  if (!pkg) return <PageLoading label="Loading package..." />;

  return (
    <div className="app-page">
      <PageHeader
        title="Edit Package"
        description={pkg.title}
        actions={<AdminBackLink href="/admin/tours/packages">← Back to packages</AdminBackLink>}
      />
      <Card>
        <CardHeader><CardTitle>{pkg.title}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...register("title")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="space-y-2"><Label>Price</Label><Input type="number" {...register("price", { valueAsNumber: true })} /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_active")} /> Active</label>
              <label className="flex items-center gap-2 text-sm text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_featured")} /> Featured</label>
            </div>
            {message && <p className="text-sm text-status-success md:col-span-2">{message}</p>}
            <div className="md:col-span-2"><Button type="submit">Save Package</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Itinerary Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
            <div><Button type="button" onClick={addDay}><Plus className="mr-2 h-4 w-4" />Add Day</Button></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
