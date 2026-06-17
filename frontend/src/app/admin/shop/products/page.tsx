"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, type Product } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export default function ShopProductsPage() {
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminProducts(token).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
          <p className="mt-1 text-zinc-500">Manage sports shop inventory</p>
        </div>
        <Button asChild><Link href="/admin/shop/products/new"><Plus className="mr-2 h-4 w-4" />Add Product</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Products</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-zinc-500">Loading...</p> : products.length === 0 ? (
            <p className="text-sm text-zinc-500">No products yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-500">
                  <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">SKU</th><th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Stock</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-50">
                    <td className="py-3 pr-4 font-medium">{p.name}</td>
                    <td className="py-3 pr-4">{p.sku}</td>
                    <td className="py-3 pr-4">₹{p.price}</td>
                    <td className="py-3 pr-4">{p.stock}</td>
                    <td className="py-3 pr-4"><span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{p.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="py-3"><Link href={`/admin/shop/products/${p.id}`} className="text-indigo-600 hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
