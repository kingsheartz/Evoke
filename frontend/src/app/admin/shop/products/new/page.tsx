"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { AdminBackLink, FormError } from "@/components/admin/admin-form-primitives";
import { CategorySelectField } from "@/components/admin/category-select-field";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  category_id: z.number().min(1, "Select a category"),
  name: z.string().min(2),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  description: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category_id: 0, price: 0, stock: 0 },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    try {
      const { data: product } = await apiClient.createProduct(token, data);
      router.push(`/admin/shop/products/${product.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        title="New Product"
        actions={<AdminBackLink href="/admin/shop/products">← Back to products</AdminBackLink>}
      />
      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input {...register("name")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <CategorySelectField
                  module="shop"
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  error={errors.category_id?.message}
                />
              )}
            />
            <div className="space-y-2"><Label>SKU</Label><Input {...register("sku")} /></div>
            <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register("stock", { valueAsNumber: true })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>SEO title</Label><Input {...register("seo_title")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>SEO description</Label><Textarea rows={2} {...register("seo_description")} /></div>
            <FormError message={error} className="md:col-span-2" />
            <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting}>Create Product</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
