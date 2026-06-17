"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  title: z.string().min(2),
  destination: z.string().min(2),
  type: z.string(),
  duration_days: z.number().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
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
    <div>
      <Link href="/admin/tours/packages" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold">New Tour Package</h1>
      <Card>
        <CardHeader><CardTitle>Package Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...register("title")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="space-y-2"><Label>Destination</Label><Input {...register("destination")} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select {...register("type")} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
                <option value="domestic">Domestic</option><option value="international">International</option>
                <option value="adventure">Adventure</option><option value="group">Group</option><option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" {...register("duration_days", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" {...register("price", { valueAsNumber: true })} /></div>
            <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting}>Create Package</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
