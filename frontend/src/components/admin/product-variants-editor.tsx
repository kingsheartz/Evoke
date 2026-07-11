"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, type ProductVariant } from "@/lib/api";
import { revalidateShopPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

type DraftVariant = {
  id?: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
};

const emptyVariant = (): DraftVariant => ({
  sku: "",
  name: "",
  price: 0,
  stock: 0,
});

export function ProductVariantsEditor({
  productId,
  productSlug,
  initialVariants = [],
}: {
  productId: number;
  productSlug?: string;
  initialVariants?: ProductVariant[];
}) {
  const token = useAuthStore((s) => s.token);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [draft, setDraft] = useState<DraftVariant>(emptyVariant());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const reload = async () => {
    if (!token) return;
    const response = await apiClient.getProductVariants(token, productId);
    setVariants(response.data);
  };

  const revalidate = async () => {
    if (productSlug) await revalidateShopPublicCache(productSlug);
  };

  const addVariant = async () => {
    if (!token || !draft.name.trim() || !draft.sku.trim()) return;
    setMessage(null);
    try {
      await apiClient.createProductVariant(token, productId, draft);
      setDraft(emptyVariant());
      await reload();
      await revalidate();
      setMessage("Variant added.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add variant.");
    }
  };

  const updateVariant = async (variant: ProductVariant, patch: Partial<DraftVariant>) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.updateProductVariant(token, productId, variant.id, patch);
      await reload();
      await revalidate();
      setMessage("Variant updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update variant.");
    }
  };

  const removeVariant = async (variantId: number) => {
    if (!token) return;
    setMessage(null);
    try {
      await apiClient.deleteProductVariant(token, productId, variantId);
      await reload();
      await revalidate();
      setMessage("Variant removed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not remove variant.");
    }
  };

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <VariantRow
          key={variant.id}
          variant={variant}
          onSave={(patch) => updateVariant(variant, patch)}
          onRemove={() => removeVariant(variant.id)}
        />
      ))}

      <div className="grid gap-3 rounded-lg border border-dashed border-app-border bg-app-surface/60 p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Variant name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Size M / Red"
          />
        </div>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input
            value={draft.sku}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
            placeholder="Unique SKU"
          />
        </div>
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input
            type="number"
            step="0.01"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            value={draft.stock}
            onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="button" onClick={addVariant}>
            <Plus className="mr-2 h-4 w-4" />
            Add variant
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-app-muted">{message}</p>}
    </div>
  );
}

function VariantRow({
  variant,
  onSave,
  onRemove,
}: {
  variant: ProductVariant;
  onSave: (patch: Partial<DraftVariant>) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(variant.name);
  const [sku, setSku] = useState(variant.sku);
  const [price, setPrice] = useState(Number(variant.price));
  const [stock, setStock] = useState(variant.stock);

  useEffect(() => {
    setName(variant.name);
    setSku(variant.sku);
    setPrice(Number(variant.price));
    setStock(variant.stock);
  }, [variant]);

  return (
    <div className="rounded-lg border border-app-border bg-app-surface/80 p-4 ring-1 ring-app-border">
      <HorizontalScroll>
        <div className="grid min-w-[40rem] grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_8rem_8rem_auto] items-end gap-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Price</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} />
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => onSave({ name, sku, price, stock })}>
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
        </div>
      </HorizontalScroll>
    </div>
  );
}
