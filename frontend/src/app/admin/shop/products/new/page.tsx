"use client";

import { useEffect, useState } from "react";
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
import { apiClient, type ShopCategory } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  category_id: z.number().min(1),
  name: z.string().min(2),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { price: 0, stock: 0 },
  });

  useEffect(() => { apiClient.getShopCategories().then((r) => setCategories(r.data)); }, []);

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
    <div>
      <Link href="/admin/shop/products" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold">New Product</h1>
      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input {...register("name")} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select {...register("category_id", { valueAsNumber: true })} className="flex h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm">
                <option value={0}>Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>SKU</Label><Input {...register("sku")} /></div>
            <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register("stock", { valueAsNumber: true })} /></div>
            {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
            <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting}>Create Product</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
