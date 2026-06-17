"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, type Product } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function EditProductPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<{ name: string; description: string; price: number; stock: number; is_active: boolean; is_featured: boolean }>();

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminProduct(token, id).then((r) => {
      setProduct(r.data);
      reset({ name: r.data.name, description: r.data.description ?? "", price: Number(r.data.price), stock: r.data.stock, is_active: r.data.is_active, is_featured: r.data.is_featured });
    });
  }, [token, id, reset]);

  const onSubmit = async (data: { name: string; description: string; price: number; stock: number; is_active: boolean; is_featured: boolean }) => {
    if (!token) return;
    try {
      await apiClient.updateProduct(token, id, data);
      setMessage("Product updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!product) return <p className="text-sm text-zinc-500">Loading...</p>;

  return (
    <div>
      <Link href="/admin/shop/products" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold">Edit Product</h1>
      <Card>
        <CardHeader><CardTitle>{product.name}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input {...register("name")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register("stock", { valueAsNumber: true })} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" {...register("is_active")} /><Label>Active</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" {...register("is_featured")} /><Label>Featured</Label></div>
            {message && <p className="text-sm text-emerald-600 md:col-span-2">{message}</p>}
            <div className="md:col-span-2"><Button type="submit">Save</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
