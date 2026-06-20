"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { GalleryUrlsField, normalizeUrlList } from "@/components/admin/gallery-urls-field";
import { ProductVariantsEditor } from "@/components/admin/product-variants-editor";
import { StringListField, normalizeStringList } from "@/components/admin/string-list-field";
import { AdminBackLink } from "@/components/admin/admin-form-primitives";
import { CategorySelectField } from "@/components/admin/category-select-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, type Product } from "@/lib/api";
import { revalidateShopPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

interface EditForm {
  category_id: number;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  stock: number;
  seo_title: string;
  seo_description: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, control } = useForm<EditForm>();

  const load = () => {
    if (!token) return;
    apiClient.getAdminProduct(token, id).then((r) => {
      setProduct(r.data);
      setImages(r.data.images ?? []);
      setRelatedSlugs(r.data.related_slugs ?? []);
      reset({
        category_id: r.data.category_id,
        name: r.data.name,
        description: r.data.description ?? "",
        price: Number(r.data.price),
        compare_price: r.data.compare_price ? Number(r.data.compare_price) : undefined,
        stock: r.data.stock,
        seo_title: r.data.seo_title ?? "",
        seo_description: r.data.seo_description ?? "",
        is_active: r.data.is_active,
        is_featured: r.data.is_featured,
      });
    });
  };

  useEffect(load, [token, id, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateProduct(token, id, {
        ...data,
        compare_price: data.compare_price && Number.isFinite(data.compare_price) ? data.compare_price : null,
        images: normalizeUrlList(images),
        related_slugs: normalizeStringList(relatedSlugs),
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
      });
      await revalidateShopPublicCache(product?.slug);
      setMessage("Product updated.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    }
  };

  if (!product) return <PageLoading label="Loading product..." />;

  return (
    <div className="app-page space-y-6">
      <PageHeader
        title="Edit Product"
        description={product.name}
        actions={<AdminBackLink href="/admin/shop/products">← Back to products</AdminBackLink>}
      />

      <Card>
        <CardHeader><CardTitle>{product.name}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input {...register("name")} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} {...register("description")} /></div>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <CategorySelectField module="shop" value={field.value ?? 0} onChange={field.onChange} />
                )}
              />
              <div className="space-y-2"><Label>SKU</Label><Input value={product.sku} disabled className="opacity-70" /></div>
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Compare at price (₹)</Label><Input type="number" step="0.01" {...register("compare_price", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register("stock", { valueAsNumber: true })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>SEO title</Label><Input {...register("seo_title")} /></div>
              <div className="space-y-2 md:col-span-2"><Label>SEO description</Label><Textarea rows={2} {...register("seo_description")} /></div>
              <div className="flex items-center gap-2 text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_active")} /><Label>Active</Label></div>
              <div className="flex items-center gap-2 text-app-text"><input type="checkbox" className="form-checkbox" {...register("is_featured")} /><Label>Featured</Label></div>
            </div>

            <GalleryUrlsField values={images.length ? images : [""]} onChange={setImages} />
            <StringListField
              label="Pinned related products"
              addLabel="Add slug"
              values={relatedSlugs.length ? relatedSlugs : [""]}
              onChange={setRelatedSlugs}
              placeholder="product-url-slug"
            />
            <p className="-mt-2 text-xs text-app-muted">
              Optional slugs shown first on the detail page related grid. Leave empty for automatic recommendations.
            </p>

            {message && (
              <p className={cn("text-sm", message.includes("updated") ? "text-status-success" : "text-status-error")}>
                {message}
              </p>
            )}
            <Button type="submit">Save product</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-app-muted">Optional size, color, or other purchasable variants.</p>
          <ProductVariantsEditor productId={id} productSlug={product.slug} initialVariants={product.variants ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
