"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  title: z.string().min(2),
  destination: z.string().min(2),
  type: z.string(),
  duration_days: z.number().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewPackagePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "domestic", duration_days: 3, price: 0 },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    const { data: pkg } = await apiClient.createPackage(token, data);
    router.push(`/admin/tours/packages/${pkg.id}`);
  };

  return (
    <div className="app-page">
      <PageHeader
        title="New Tour Package"
        actions={<AdminBackLink href="/admin/tours/packages">← Back to packages</AdminBackLink>}
      />
      <Card>
        <CardHeader><CardTitle>Package Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...register("title")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="space-y-2"><Label>Destination</Label><Input {...register("destination")} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select {...register("type")}>
                <option value="domestic">Domestic</option><option value="international">International</option>
                <option value="adventure">Adventure</option><option value="group">Group</option><option value="custom">Custom</option>
              </Select>
            </div>
            <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" {...register("duration_days", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" {...register("price", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Available from</Label><Input type="date" {...register("available_from")} /></div>
            <div className="space-y-2"><Label>Available until</Label><Input type="date" {...register("available_until")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>SEO title</Label><Input {...register("seo_title")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>SEO description</Label><Textarea rows={2} {...register("seo_description")} /></div>
            <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting}>Create Package</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
