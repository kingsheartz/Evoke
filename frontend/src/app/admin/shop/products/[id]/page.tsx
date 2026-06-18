"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { CategorySelectField } from "@/components/admin/category-select-field";
import { apiClient, type Product } from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

interface EditForm {
  category_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, control } = useForm<EditForm>();

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminProduct(token, id).then((r) => {
      setProduct(r.data);
      reset({
        category_id: r.data.category_id,
        name: r.data.name,
        description: r.data.description ?? "",
        price: Number(r.data.price),
        stock: r.data.stock,
        is_active: r.data.is_active,
        is_featured: r.data.is_featured,
      });
    });
  }, [token, id, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!token) return;
    try {
      await apiClient.updateProduct(token, id, data);
      setMessage("Product updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!product) return <PageLoading label="Loading product..." />;

  return (
    <div className="app-page">
      <PageHeader
        title="Edit Product"
        description={product.name}
        actions={<AdminBackLink href="/admin/shop/products">← Back to products</AdminBackLink>}
      />
      <Card>
        <CardHeader><CardTitle>{product.name}</CardTitle></CardHeader>
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
                />
              )}
            />
            <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register("stock", { valueAsNumber: true })} /></div>
            <div className="flex items-center gap-2 text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_active")} /><Label>Active</Label></div>
            <div className="flex items-center gap-2 text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_featured")} /><Label>Featured</Label></div>
            {message && (
              <p className={cn("text-sm md:col-span-2", message.includes("updated") ? "text-status-success" : "text-status-error")}>
                {message}
              </p>
            )}
            <div className="md:col-span-2"><Button type="submit">Save</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
